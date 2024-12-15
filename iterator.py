from openvino_genai import StreamerBase
from queue import Queue
import time

class IterableStreamer(StreamerBase):
    def __init__(self, tokenizer, prompt):
        super().__init__()
        self.tokenizer = tokenizer
        self.tokens_cache = []
        self.text_queue = Queue()
        self.print_len = 0
        self.prompt = prompt

    def __iter__(self):
        return self
    
    def __next__(self):
        value = self.text_queue.get(timeout=10.0)  # get() will be blocked until a token is available.
        if value is None or "<end_of_turn>" in value:
            print("stop", value)
            raise StopIteration
        while not self.text_queue.empty():
            token = self.text_queue.get(timeout=10.0)
            if token is not None and token != "<end_of_turn>":
              value = value + token
            else:
              self.put_word(None)
              break
        return value
    
    def get_stop_flag(self):
        return False
    
    def put_word(self, word: str):
        self.text_queue.put(word, timeout=60.0)

    def put(self, token_id: int) -> bool:     
        self.tokens_cache.append(token_id)
        text = self.tokenizer.decode(self.tokens_cache)
        word = ''
        if len(text) > self.print_len and '\n' == text[-1]:
            word = text[self.print_len:]            
            self.tokens_cache = []
            self.print_len = 0
        elif len(text) >= 3 and text[-3:] == chr(65533):
            # Don't print incomplete text.
            pass
        elif len(text) > self.print_len:
            word = text[self.print_len:]
            self.print_len = len(text)
        self.put_word(word)        
        
        if self.get_stop_flag():
            self.end()
            return True 
        else:
            return False 
        
    def end(self):
        text = self.tokenizer.decode(self.tokens_cache)
        if len(text) > self.print_len:
            word = text[self.print_len:]
            self.put_word(word)
            self.tokens_cache = []
            self.print_len = 0
        self.put_word(None)

        #with open(f'data/chats/{str(time.time())}.txt',"w", encoding='utf-8') as file_object:
        #    file_object.write(f"{self.prompt}|${text}")  