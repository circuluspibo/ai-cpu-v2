from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from serverinfo import si
import librosa
from fastapi import FastAPI, File, UploadFile
from transformers import AutoTokenizer
from fastapi.responses import FileResponse, StreamingResponse
import langid
import random
import ctranslate2
from PIL import Image
from transformers import AutoTokenizer
from huggingface_hub import snapshot_download, hf_hub_download
import base64
import time as t
from threading import Event, Thread
from transformers import AutoTokenizer
from pydantic import BaseModel, Field
from iterator import IterableStreamer
import numpy as np
import openvino_genai as ov_genai
import onnxruntime as rt
import utils
import commons
from scipy.io.wavfile import write
from text import text_to_sequence
import torch
from serverinfo import si
from llama_cpp import Llama
from openvino import Core
import asyncio
from typing import List


_MAX_LENGTH = 16384

class Message(BaseModel):
    role: str  # 'user' 또는 'assistant'
    content: str

class Chat(BaseModel):
  prompt : str
  lang : str = 'auto'
  type : str = "당신은 서큘러스에서 만든 다윗 이라고 하는 10살 남자아이 성향의 유쾌한 로봇으로, 이모티콘도 활용해서 대화형식으로 대답하길 바래!"
  history: List[Message]
  rag :  str = ''  
  temp : float = 0.6
  top_p : float = 0.92
  top_k : int = 20
  max : int = _MAX_LENGTH

_IP = si.getIP()
_PORT = int(open("port.txt", 'r').read())

class Param (BaseModel):
  text : str
  hash : str = Field(default='')
  voice : str = Field(default='main') 
  lang : str = Field(default='ko')
  type : str = Field(default='mp3')
  pitch : str = Field(default='medium')
  rate : str = Field(default='medium')
  volume : str = Field(default='medium')


model_en2ko = ctranslate2.Translator(snapshot_download(repo_id="circulus/canvers-en2ko-ct2-v1"), device="cpu")
token_en2ko = AutoTokenizer.from_pretrained("circulus/canvers-en2ko-v1")

model_ko2en = ctranslate2.Translator(snapshot_download(repo_id="circulus/canvers-ko2en-ct2-v1"), device="cpu")
token_ko2en = AutoTokenizer.from_pretrained("circulus/canvers-ko2en-v1")

#path_txt = snapshot_download(repo_id="circulus/Qwen3-1.7B-ko-ov-sym-int4")
#path_txt = "dnotitia/Smoothie-Qwen3-1.7B"
#pipe_txt = ov_genai.LLMPipeline(path_txt, "CPU")
#model_txt = Llama.from_pretrained(repo_id="rippertnt/Smoothie-Qwen3-1.7B-Q4_K_M-GGUF", filename="smoothie-qwen3-1.7b-q4_k_m.gguf", n_threads=4, verbose=False)
#token_txt =  AutoTokenizer.from_pretrained(path_txt)

#path_txt = "kakaocorp/kanana-1.5-2.1b-instruct-2505"
#model_txt = Llama.from_pretrained(repo_id="JJS0321/kanana-1.5-2.1b-instruct-2505-gguf", filename="kanana-2.3B-1.5-Q4_K_M.gguf", n_threads=4, verbose=False)
#token_txt =  AutoTokenizer.from_pretrained(path_txt)

#model_txt = Llama.from_pretrained(repo_id="rippertnt/Qwen3-0.6B-Q4_K_M-GGUF", filename="qwen3-0.6b-q4_k_m.gguf", n_threads=4, verbose=False)
#token_txt = AutoTokenizer.from_pretrained("Qwen/Qwen3-0.6B")

#model_txt = Llama.from_pretrained(repo_id="unsloth/gemma-3-1b-it-GGUF", filename="gemma-3-1b-it-Q4_K_M.gguf", n_threads=4, verbose=False)
#token_txt = AutoTokenizer.from_pretrained("unsloth/gemma-3-1b-it")

model_txt = Llama.from_pretrained(repo_id="rippertnt/HyperCLOVAX-SEED-Text-Instruct-1.5B-Q4_K_M-GGUF", filename="hyperclovax-seed-text-instruct-1.5b-q4_k_m.gguf", n_threads=4, n_ctx=8192, verbose=False)
token_txt = AutoTokenizer.from_pretrained("rippertnt/HyperCLOVAX-SEED-Text-Instruct-1.5B-Q4_K_M-GGUF")


model_real = snapshot_download(repo_id="circulus/on-canvers-real-v3.9.1-int8")
pipe_real = ov_genai.Text2ImagePipeline(model_real, device="CPU")

model_story = snapshot_download(repo_id="circulus/on-canvers-story-v3.9.1-int8")
pipe_story = ov_genai.Text2ImagePipeline(model_story, device="CPU")

model_disney = snapshot_download(repo_id="circulus/on-canvers-disney-v3.9.1-int8")
pipe_disney = ov_genai.Text2ImagePipeline(model_disney, device="CPU")

model_stt = snapshot_download(repo_id="circulus/whisper-large-v3-turbo-ov-int4")
pipe_stt = ov_genai.WhisperPipeline(model_stt,device="CPU")

#ko_base_f16.onnx / OpenVINOExecutionProvider
#pipe_tts = rt.InferenceSession(hf_hub_download(repo_id="rippertnt/on-vits2-multi-tts-v1", filename="ko_base_f16.onnx"), sess_options=rt.SessionOptions(), providers=["CPUExecutionProvider"], provider_options=[{"device_type" : "CPU" }]) #, "precision" : "FP16"
#conf_tts = utils.get_hparams_from_file(hf_hub_download(repo_id="rippertnt/on-vits2-multi-tts-v1", filename="ko_base.json"))
core = Core()
config = {"PERFORMANCE_HINT": "LATENCY"}
path_tts = snapshot_download(repo_id="rippertnt/on-vits2-multi-tts-v1", allow_patterns="*ov*")
pipe_tts = core.compile_model(core.read_model(model=f"{path_tts}/all_base_ov.xml"), device_name="CPU", config=config)
conf_tts = utils.get_hparams_from_file(hf_hub_download(repo_id="rippertnt/on-vits2-multi-tts-v1", filename="all_base.json"))

def trans_ko2en(prompt):
  source = token_ko2en.convert_ids_to_tokens(token_ko2en.encode(prompt))
  results = model_ko2en.translate_batch([source])
  target = results[0].hypotheses[0]
  return token_ko2en.decode(token_ko2en.convert_tokens_to_ids(target), skip_special_tokens=True)

def trans_en2ko(prompt):
  source = token_en2ko.convert_ids_to_tokens(token_en2ko.encode(prompt))
  results = model_en2ko.translate_batch([source])
  target = results[0].hypotheses[0]
  return token_en2ko.decode(token_en2ko.convert_tokens_to_ids(target), skip_special_tokens=True)

app = FastAPI()
origins = [
    "http://canvers.net",
    "https://canvers.net",   
    "http://www.canvers.net",
    "https://www.canvers.net",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],#origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Generator(ov_genai.Generator):
    def __init__(self, seed, mu=0.0, sigma=1.0):
        ov_genai.Generator.__init__(self)
        np.random.seed(seed)
        self.mu = mu
        self.sigma = sigma

    def next(self):
        return np.random.normal(self.mu, self.sigma)

async def generate_text_stream(chat : Chat, isStream=True):

    if chat.rag is not None and len(chat.rag) > 10: 
      chat.type=  f"{chat.type} 그리고, 다음 내용을 참고하여 대답을 하되 잘 모르는 내용이면 모른다고 솔직하게 대답하세요.\n<|context|>\n{chat.rag}"    

    chat_history = [{"role": "system","content": chat.type}]
  
    if hasattr(chat, "history") and isinstance(chat.history, list):
        for msg in chat.history:
            if  isinstance(msg, Message):
              chat_history.append(msg.dict())

    chat_history.append({ "role": "user","content": chat.prompt})
    print(chat_history)

    prompt = token_txt.apply_chat_template(chat_history, tokenize=False,add_generation_prompt=True)
	
    response = model_txt.create_completion(prompt, max_tokens=chat.max, temperature=chat.temp, top_k=chat.top_k,top_p=chat.top_p,repeat_penalty=1.1, stream=True)
    sentence = ""

    for chunk in response:
        if "choices" in chunk and chunk["choices"]:
            new_token =  chunk["choices"][0]["text"]
            if isStream:
              print(new_token, end="", flush=True)
              yield new_token
              await asyncio.sleep(0) 
            elif "." in new_token or "\n" in new_token:
              sentence = sentence + new_token
              if len(sentence) > 3:
                sentence = sentence.strip()
                print(sentence)
                yield sentence
                await asyncio.sleep(0) 
                sentence = ""
            else:
              sentence = sentence + new_token
    if len(sentence) > 3:
       yield sentence
        #await asyncio.sleep(0.01)  # 비동기 처리를 위한 작은 딜레이

def stream_en2ko(prompts):
  prompts = prompts.split('\n') #[:-1] for xgen patch
  print(prompts)
  length = len(prompts)
  for idx, prompt in enumerate(prompts):
    if len(prompt) > 1:
      result = trans_en2ko(prompt)
      if idx < length - 1:
        yield result + "</br>"
      else:
        yield result
    elif idx < length - 1:
      yield "</br>"      

def stream_ko2en(prompts):
  prompts = prompts.split('\n') #[:-1] for xgen
  length = len(prompts)

  for idx, prompt in enumerate(prompts):
    if len(prompt) > 1:
      result = trans_ko2en(prompt)

      if idx < length - 1:
        yield result + "</br>"
      else:
        yield result
    elif idx < length - 1:
      yield "</br>"

## for openvino
async def process_stream(streamer, isStream=True):
  print("streaming start...")
  
  sentence = ""
  for new_token in streamer:
    print(new_token, end="", flush=True)

    if isStream:
      yield new_token
      await asyncio.sleep(0) 
    elif "." in new_token or "\n" in new_token:
      sentence = sentence + new_token
      if len(sentence) > 3:
        yield sentence
        await asyncio.sleep(0) 
        sentence = ""
    else:
      sentence = sentence + new_token


async def stream_response(chat, isStream=True):
  generator = process_stream(chat, isStream)
  sentence = ""

  while not generator.is_done():
    generator.generate_next_token()
    token = generator.get_next_tokens()[0]
    new_token = token_txt.decode(token) 
    print(new_token, end="", flush=True)
    if isStream:
      yield new_token
      await asyncio.sleep(0) 
    elif "." in new_token or "\n" in new_token:
      sentence = sentence + new_token
      if len(sentence) > 3:
        yield sentence
        await asyncio.sleep(0) 
        sentence = ""
    else:
      sentence = sentence + new_token


@app.get("/")
def main():
  return { "result" : True, "data" : "AI-CPU-V2", "ip" : _IP, "port" : _PORT }      

@app.get("/monitor")
def monitor():
  return si.getAll()


@app.post("/v1/txt2chat", summary="문장 기반의 chatgpt 스타일 구현 / batch ")
def txt2chat(chat : Chat, isThink=0): # gen or med
  """
  token = pipe_txt.get_tokenizer()
  streamer = IterableStreamer(token)

  messages = [
    {"role": "system", "content": chat.type},
    {"role": "user", "content": chat.prompt}
  ] 

  think = False
  if int(isThink) > 0:
    think = True

  prompt = token_txt.apply_chat_template(
    messages,
    tokenize=False,
    add_generation_prompt=True,
    enable_thinking=think
  )

  generate_kwargs = dict(
      inputs = prompt,
      max_new_tokens=int(chat.max),
      temperature=float(chat.temp), 
      #do_sample=True,
      repetition_penalty=1.1,
      top_k=int(chat.top_k),
      top_p=float(chat.top_p),
      apply_chat_template=False,
      streamer=streamer, # !do_sample || top_k > 0
  )

  t1 = Thread(target=pipe_txt.generate, kwargs=generate_kwargs)
  t1.start()

  out = process_stream(streamer, False)
  return StreamingResponse(out, media_type="text/plain")
  """
  return StreamingResponse(generate_text_stream(chat, False), media_type="text/plain")

@app.post("/v2/txt2chat", summary="문장 기반의 chatgpt 스타일 구현 / stream")
def txt2chat2(chat : Chat, isThink=0): # gen or med
  """
  token = pipe_txt.get_tokenizer()
  streamer = IterableStreamer(token, prompt = chat.prompt)

  messages = [
    {"role": "system", "content": chat.type},
    {"role": "user", "content": chat.prompt}
  ] 

  think = False
  if int(isThink) > 0:
    think = True

  prompt = token_txt.apply_chat_template(
    messages,
    tokenize=False,
    add_generation_prompt=True,
    enable_thinking=think
  )

  generate_kwargs = dict(
      inputs = prompt,
      max_new_tokens=int(chat.max),
      temperature=float(chat.temp),
      #do_sample=True,
      repetition_penalty=1.1,
      top_k=int(chat.top_k),
      top_p=float(chat.top_p),
      apply_chat_template=False,
      streamer=streamer, # !do_sample || top_k > 0
  )

  t1 = Thread(target=pipe_txt.generate, kwargs=generate_kwargs)
  t1.start()

  out = process_stream(streamer, True)
  return StreamingResponse(out, media_type="text/plain")
  """
  return StreamingResponse(generate_text_stream(chat, True), media_type="text/plain")


@app.get("/")
def main():
  return { "result" : True, "data" : "AI-LLM-CPU V1" }      

@app.get("/monitor")
def monitor():
  return si.getAll()

@app.get("/v1/language", summary="어느 언어인지 분석합니다.")
def language(input : str):
  return { "result" : True, "data" : langid.classify(input.replace("\n",""))[0] }

@app.get("/v1/txt2real", response_class=FileResponse, summary="입력한 문장으로 부터 이미지를 생성합니다.")
def txt2real(prompt = "", positive = "", negative = "", w=512, h=896, steps=4, scale=8.0, lang='auto',upscale=0, enhance=1, seed=random.randint(-2147483648, 2147483647), nsfw=1):
    start = t.time()
    prompt = prompt +", high quality, delicated, 8K highres, masterpiece."
    image_tensor = pipe_real.generate(prompt, num_inference_steps=int(steps), guidance_scale=float(scale), height=int(w), width=int(h),num_images_per_prompt=1,generator=Generator(int(seed)))
    print(t.time()-start)
    image = Image.fromarray(image_tensor.data[0])
    image.save(f"{start}.png")
    return f"{start}.png"

@app.get("/v1/txt2disney", response_class=FileResponse, summary="입력한 문장으로 부터 이미지를 생성합니다.")
def txt2disney(prompt = "", positive = "", negative = "", w=512, h=896, steps=4, scale=8.0, lang='auto',upscale=0, enhance=1, seed=random.randint(-2147483648, 2147483647), nsfw=1):
    start = t.time()
    prompt = prompt +", high quality, delicated, 8K highres, masterpiece."
    image_tensor = pipe_disney.generate(prompt, num_inference_steps=int(steps), guidance_scale=float(scale), height=int(w), width=int(h),num_images_per_prompt=1,generator=Generator(int(seed)))
    print(t.time()-start)
    image = Image.fromarray(image_tensor.data[0])
    image.save(f"{start}.png")
    return f"{start}.png"

@app.get("/v1/txt2story", response_class=FileResponse, summary="입력한 문장으로 부터 이미지를 생성합니다.")
def txt2story(prompt = "", positive = "", negative = "", w=512, h=896, steps=4, scale=8.0, lang='auto',upscale=0, enhance=1, seed=random.randint(-2147483648, 2147483647), nsfw=1):
    start = t.time()
    prompt = prompt +", high quality, delicated, 8K highres, masterpiece."
    image_tensor = pipe_story.generate(prompt, num_inference_steps=int(steps), guidance_scale=float(scale), height=int(w), width=int(h),num_images_per_prompt=1,generator=Generator(int(seed)))
    print(t.time()-start)
    image = Image.fromarray(image_tensor.data[0])
    image.save(f"{start}.png")
    return f"{start}.png"

@app.post("/v1/stt", summary="음성을 인식합니다.")
def stt(file : UploadFile = File(...), lang="ko"):
  start = t.time()
  location = f"uploads/{file.filename}"

  with open(location,"wb+") as file_object:
    file_object.write(file.file.read())
  
  raw_speech, samplerate = librosa.load(location, sr=16000)
  print('length',librosa.get_duration(y=raw_speech, sr=samplerate))
  raw =  raw_speech.tolist()

  out = pipe_stt.generate(
    raw,
    max_new_tokens=100,
    # 'task' and 'language' parameters are supported for multilingual models only
    language=f"<|{lang}|>",
    task="transcribe",
    #return_timestamps=True
    #streamer=streamer,
  )

  print(t.time()-start)

  return { "result" : True, "data" : str(out) }

@app.get("/v1/tts", response_class=FileResponse, summary="입력한 문장으로 부터 음성을 생성합니다.")
def tts(text = "", voice = 1, lang='ko', static=0):
    start = t.time()
    print(text, static)

    #phoneme_ids = text_to_sequence(text, conf_tts.data.text_cleaners)
    phoneme_ids = text_to_sequence(text, [f'canvers_{lang}_cleaners'])
    text = np.expand_dims(np.array(phoneme_ids, dtype=np.int64), 0)

    inputs = {
        "input": text,
        "input_lengths":  np.array([text.shape[1]], dtype=np.int64),
        "scales": np.array([0.667, 1.0, 0.8], dtype=np.float16),
        "sid" : np.array([int(voice)], dtype=np.int64) if voice is not None else None
    }

    start_time = t.time()
    result = pipe_tts(inputs)
    print(f"Inference time: {t.time() - start_time:.4f} seconds")

    audio = list(result.values())[0].squeeze((0, 1))  

    if int(static) > 0:
      write(data=audio, rate=conf_tts.data.sampling_rate, filename=f"human.wav")
      return f"human.wav"
    else:
      write(data=audio, rate=conf_tts.data.sampling_rate, filename=f"output/{str(start)}.wav")
      return f"output/{str(start)}.wav"

@app.post("/v1/ko2en", summary="한국어를 영어로 번역합니다.")
def ko2en(param : Param):
  return { "result" : True, "data" : trans_ko2en(param.prompt) }

@app.post("/v1/en2ko", summary="영어를 한국어로 번역합니다.")
def en2ko(param : Param):
  return { "result" : True, "data" : trans_en2ko(param.prompt) }

print("Loading Complete!")
