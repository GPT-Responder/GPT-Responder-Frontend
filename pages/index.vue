<template>
  <div class="flex flex-col h-screen">
    <!-- Chat Messages Area -->
    <div class="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-100">
      <div v-for="(message, index) in messages" :key="index" :class="message.isUser ? 'bg-blue-200' : 'bg-white'">
        <div v-html="message.text" class="p-4 shadow-md rounded-md"></div>
      </div>
    </div>

    <!-- Horizontal Rule -->
    <hr class="border-t-2 border-gray-300" />


    <!-- Textarea for Typing Messages -->
    <div class="p-2 bg-gray-200 relative">
      <Textarea 
        v-model="userInput" 
        class="resize-none bg-white-100 pr-20" 
        placeholder="Send a message..."
        @keydown.enter.prevent="handleEnter"
      ></Textarea>
      <Button @click="sendMessage" class="absolute bottom-5 right-5">Send</Button> <!-- Add absolute positioning here -->
    </div>

  </div>
</template>

<script lang="ts">
  import { defineComponent, ref } from 'vue';
  import MarkdownIt from 'markdown-it';

  const md = new MarkdownIt();

  export default defineComponent({
    setup() {
      const messages = ref([]);
      const userInput = ref('');

      async function sendMessage() {
        let question = userInput.value;
        messages.value.push({ text: md.render(question), isUser: true });
        userInput.value = '';

        // Add an empty message slot for the bot's response.
        const botMessageIndex = messages.value.push({ text: '', isUser: false }) - 1;

        const response = await fetch(`http://100.114.94.92:5000/question/${question}`);
        const reader = response.body.getReader();

        let accumulatedChunks = '';
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            break;
          }
          // accumulatedChunks += new TextDecoder("utf-8").decode(value);
          accumulatedChunks += new TextDecoder("utf-8").decode(value);
          messages.value[botMessageIndex].text = md.render(accumulatedChunks.trim());
        }
      }


      function handleEnter(event: KeyboardEvent) {
        if (event.shiftKey) {
            // Add a new line to userInput when Shift + Enter is pressed
            userInput.value += '\n';
        } else {
            // Send the message when Enter is pressed
            sendMessage();
        }
}

      return {
        messages,
        userInput,
        sendMessage,
        handleEnter,
      };
    },
  });
</script>

