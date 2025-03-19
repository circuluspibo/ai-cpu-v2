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
import onnxruntime_genai as og
import onnxruntime as rt
import utils
import commons
from scipy.io.wavfile import write
from text import text_to_sequence
import torch
from serverinfo import si
import onnxruntime_genai as og
from llama_cpp import Llama
import asyncio

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


class Chat(BaseModel):
  prompt : str
  lang : str = 'auto'
  type : str =  "당신은 서큘러스에서 만든 다윗 이라고 하는 10살 남자아이 성향의 유쾌한 다국어 인공지능 입니다. 젊은 톤의 대화체로 입력된 언어로 응답하세요." #" "당신은 데이비드라고 하는 10살 남자아이 성향의 유쾌하고 즐거운 인공지능입니다. 이모티콘도 잘 활용해서 젊은 말투로 대답하세요."
  rag :  str = ''  
  temp : float = 0.5
  top_p : float = 0.92
  top_k : int = 50
  max : int = 16384


model_en2ko = ctranslate2.Translator(snapshot_download(repo_id="circulus/canvers-en2ko-ct2-v1"), device="cpu")
token_en2ko = AutoTokenizer.from_pretrained("circulus/canvers-en2ko-v1")

model_ko2en = ctranslate2.Translator(snapshot_download(repo_id="circulus/canvers-ko2en-ct2-v1"), device="cpu")
token_ko2en = AutoTokenizer.from_pretrained("circulus/canvers-ko2en-v1")

#from huggingface_hub import snapshot_download
#model_txt = snapshot_download(repo_id="circulus/on-gemma-2-2b-it-ov-int4", filename="gemma-3-1b-it-Q4_K_M.gguf")
#pipe_txt = ov_genai.LLMPipeline(model_txt, "CPU")
#tk =  AutoTokenizer.from_pretrained(model_txt)

model_txt = Llama.from_pretrained(repo_id="unsloth/gemma-3-1b-it-GGUF", filename="gemma-3-1b-it-Q4_K_M.gguf", n_threads=4, verbose=False)
# unsloth/gemma-3-1b-it-GGUF
# gemma-3-1b-it-Q4_K_M.gguf
token_txt = AutoTokenizer.from_pretrained("unsloth/gemma-3-1b-it")

# n_gpu_layers=-1,

model_real = snapshot_download(repo_id="circulus/on-canvers-real-v3.9.1-int8")
pipe_real = ov_genai.Text2ImagePipeline(model_real, device="CPU")

model_story = snapshot_download(repo_id="circulus/on-canvers-story-v3.9.1-int8")
pipe_story = ov_genai.Text2ImagePipeline(model_story, device="CPU")

model_disney = snapshot_download(repo_id="circulus/on-canvers-disney-v3.9.1-int8")
pipe_disney = ov_genai.Text2ImagePipeline(model_disney, device="CPU")

model_stt = snapshot_download(repo_id="circulus/whisper-large-v3-turbo-ov-int4")
pipe_stt = ov_genai.WhisperPipeline(model_stt,device="CPU")
#ko_base_f16.onnx / OpenVINOExecutionProvider
pipe_tts = rt.InferenceSession(hf_hub_download(repo_id="rippertnt/on-vits2-multi-tts-v1", filename="ko_base_f16.onnx"), sess_options=rt.SessionOptions(), providers=["CPUExecutionProvider"], provider_options=[{"device_type" : "CPU" }]) #, "precision" : "FP16"
conf_tts = utils.get_hparams_from_file(hf_hub_download(repo_id="rippertnt/on-vits2-multi-tts-v1", filename="ko_base.json"))

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

class Generator(ov_genai.Generator):
    def __init__(self, seed, mu=0.0, sigma=1.0):
        ov_genai.Generator.__init__(self)
        np.random.seed(seed)
        self.mu = mu
        self.sigma = sigma

    def next(self):
        return np.random.normal(self.mu, self.sigma)

async def generate_text_stream(chat : Chat, isStream=True):
    
    #if len(chat.rag) > 3:
    #  chat.prompt = "<content>\n" + chat.rag + "\n\n" + chat.prompt
    if chat.rag is not None and len(chat.rag) > 10: 
      chat.type=  f"{chat.type} 그리고, 다음 내용을 참고하여 대답을 하되 잘 모르는 내용이면 모른다고 솔직하게 대답하세요.\n<|context|>\n{chat.rag}"    

    prompt = token_txt.apply_chat_template([
      {"role": "system", "content": chat.type},
      {"role": "user", "content": chat.prompt}
    ], tokenize=False,add_generation_prompt=True)
	
    response = model_txt.create_completion(prompt, max_tokens=chat.max, temperature=chat.temp, top_k=chat.top_k,top_p=chat.top_p,repeat_penalty=1.1, stream=True)
    sentence = ""
    for chunk in response:
        if "choices" in chunk and chunk["choices"]:
            new_token =  chunk["choices"][0]["text"]
            if isStream:
              #print(new_token)
              yield new_token
              await asyncio.sleep(0) 
            elif "." in new_token or "\n" in new_token:
              sentence = sentence + new_token
              if len(sentence) > 3:
                sentence = sentence.strip()
                #print(sentence)
                yield sentence
                await asyncio.sleep(0) 
                sentence = ""
            else:
              sentence = sentence + new_token
    if len(sentence) > 3:
       yield sentence
        #await asyncio.sleep(0.01)  # 비동기 처리를 위한 작은 딜레이

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

def process_stream(chat : Chat, isStream):
	if chat.rag is not None and len(chat.rag) > 10:
		chat.type=  f"{chat.type}\n그리고, 다음 내용을 참고하여 대답을 하되 잘 모르는 내용이면 모른다고 솔직하게 대답하세요.\ncontext\n{chat.rag}"
	
	prompt = token_txt.apply_chat_template([
        {"role": "system", "content": f"{chat.type}"},
        {"role": "user", "content": f"{chat.prompt}"}
    ], tokenize=False,add_generation_prompt=True)
	
	params = og.GeneratorParams(model_txt)
	params.set_search_options(max_length=chat.max, temperature=chat.temp,top_p=chat.top_p, top_k=chat.top_k, repetition_penalty=1.1)

	generator = og.Generator(model_txt, params)

	print(prompt)
	input_tokens = token_txt.encode(prompt)
	generator.append_tokens(input_tokens)

	return generator

async def stream_response(chat, isStream=True):

  generator = process_stream(chat, isStream)
  sentence = ""

  while not generator.is_done():
    generator.generate_next_token()
    token = generator.get_next_tokens()[0]
    new_token = tokenizer_stream.decode(token) 
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
def txt2chat(chat : Chat): # gen or med
  print(chat)
  return StreamingResponse(generate_text_stream(chat, False), media_type="text/plain")

@app.post("/v2/txt2chat", summary="문장 기반의 chatgpt 스타일 구현 / stream")
def txt2chat2(chat : Chat): # gen or med
  print(chat)
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
    #org_text = parse.quote(text, safe='', encoding="cp949")
    start = t.time()
    print(text, static)

    phoneme_ids = text_to_sequence(text, conf_tts.data.text_cleaners)
    if conf_tts.data.add_blank:
        phoneme_ids = commons.intersperse(phoneme_ids, 0)
    phoneme_ids = torch.LongTensor(phoneme_ids)
    text = np.expand_dims(np.array(phoneme_ids, dtype=np.int64), 0)
    text_lengths = np.array([text.shape[1]], dtype=np.int64)
    scales = np.array([0.667, 1.0, 0.8], dtype=np.float16)#dtype=np.float16) 16
    sid = np.array([int(voice)], dtype=np.int64) if voice is not None else None
    #sid = np.array([int(voice)]) if voice is not None else None
    audio = pipe_tts.run(None, {"input": text,"input_lengths": text_lengths,"scales": scales,"sid": sid})[0].squeeze((0, 1))
    #print(audio)
    print(t.time() - start)
    
    if int(static) > 0:
      write(data=audio.astype(np.float32), rate=conf_tts.data.sampling_rate, filename="output/human.wav")
      return "output/human.wav"
    else:
      write(data=audio.astype(np.float32), rate=conf_tts.data.sampling_rate, filename=f"output/{str(start)}.wav")
      return f"output/{str(start)}.wav"

@app.post("/v1/ko2en", summary="한국어를 영어로 번역합니다.")
def ko2en(param : Param):
  return { "result" : True, "data" : trans_ko2en(param.prompt) }

@app.post("/v1/en2ko", summary="영어를 한국어로 번역합니다.")
def en2ko(param : Param):
  return { "result" : True, "data" : trans_en2ko(param.prompt) }

print("Loading Complete!")
