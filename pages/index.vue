<template>
  <div class="flex flex-col h-screen">
    <!-- Chat Messages Area -->
    <div class="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-100">
      <div v-for="(message, index) in messages" :key="index" :class="message.isUser ? 'bg-blue-200 text-right' : 'bg-green-200'">
        <div class="p-4 shadow-md">
          <div class="flex justify-between items-start"> <!-- items-start ensures avatar is at the top -->

            <!-- Avatar Container -->
            <div class="flex-shrink-0">
              <Avatar>
                <AvatarImage :src="message.isUser ? None : masscotImg" alt="Profile Image" />
                <AvatarFallback>JB</AvatarFallback>
              </Avatar>
            </div>

            <!-- Message Text -->
            <div v-html="message.text" class="flex-grow mx-2 -mt-3"></div>

            <!-- Buttons Container -->
            <div v-if="!message.isUser" class="flex items-center space-x-2">
              <!-- Clipboard Button -->
              <Button @click="copyToClipboard(message, index)" variant='disabled:opacity-50' class='px-1'>
                <Icon :name="message.copied ? 'tabler:clipboard-check' : 'tabler:clipboard'" color='grey'/>
              </Button>

              <!-- Thumbs Up Button -->
              <Button @click="thumbsUp(index)" variant='disabled:opacity-50' class='px-1'>
                <Icon :name="message.isThumbsUp ? 'tabler:thumb-up-filled' : 'tabler:thumb-up'" color='grey'/>
              </Button>

              <!-- Thumbs Down Button -->
              <Button @click="thumbsDown(index)" variant='disabled:opacity-50' class='px-1'>
                <Icon :name="message.isThumbsDown ? 'tabler:thumb-down-filled' : 'tabler:thumb-down'" color='grey'/>
              </Button>
            </div>
          </div>
        </div>
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
        @keydown.enter="handleEnter"
        variant='expandable'
      ></Textarea>
      <Button
        @click="sendMessage"
        class="absolute bottom-5 right-5 px-3"
        :class="userInput.trim() ? 'text-white' : 'text-gray-500'"
        :variant="userInput.trim() ? 'default' : 'disabled:opacity-50'">
        <Icon name="iconamoon:send-fill" width="20" height="20"/>
      </Button>
    </div>
  </div>
</template>

<script lang="ts">
  import { defineComponent, ref } from 'vue';
  import MasscotImage from '@/assets/img/masscot.png';
  import MarkdownIt from 'markdown-it';

  const md = new MarkdownIt({
      linkify: true
    });

  export default defineComponent({
    setup() {
      const messages = ref([]);
      const userInput = ref('');

      async function sendMessage() {
        if (!userInput.value.trim()) return;

        let question = userInput.value;
        messages.value.push({
          text: md.render(question),
          isUser: true,
          iscopied: false,
          isThumbsUp: false,
          isThumbsDown: false,
        });
        userInput.value = '';

        // Add an empty message slot for the bot's response.
        const botMessageIndex = messages.value.push({ text: '', isUser: false }) - 1;

        const response = await fetch(`http://100.114.94.92:5000/question/${question}`);
        const reader = response.body.getReader();

        let accumulatedChunks = '';
        while (true) {
          const { done, value } = await reader.read();
          if (done) {tabler:thumb-down
            break;
          }
          // accumulatedChunks += new TextDecoder("utf-8").decode(value);
          accumulatedChunks += new TextDecoder("utf-8").decode(value);
          messages.value[botMessageIndex].text = processHtml(
            md.render(accumulatedChunks.trim())
          );

          // Save the response markdown
          messages.value[botMessageIndex].markdown = accumulatedChunks.trim();
        }
      }

      function processHtml(html) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const links = doc.querySelectorAll('a');
        links.forEach(link => {
          link.target = '_blank';
          link.rel = 'noopener noreferrer';  // For security
        });
        return doc.body.innerHTML;
      }

      function handleEnter(event: KeyboardEvent) {
          if (event.key === "Enter" && !event.shiftKey) {
              // Send the message when Enter is pressed without Shift
              sendMessage();
          }
      }

      function copyToClipboard(message: any, index: number) {
        navigator.clipboard.writeText(message.markdown).then(() => {
          // Change the copied state and icon
          messages.value[index].copied = true;

          // Set a timeout to revert the icon back after 3 seconds
          setTimeout(() => {
            messages.value[index].copied = false;
          }, 3000);

        }).catch(err => {
          console.error('Could not copy text: ', err);
        });
      }

      function thumbsUp(index: number) {
        messages.value[index].isThumbsUp = !(messages.value[index].isThumbsUp);
        messages.value[index].isThumbsDown = false;
      }

      function thumbsDown(index: number) {
        messages.value[index].isThumbsUp = false;
        messages.value[index].isThumbsDown = !(messages.value[index].isThumbsDown);
      }
      return {
        masscotImg: MasscotImage,
        messages,
        userInput,
        sendMessage,
        handleEnter,
        copyToClipboard,
        thumbsUp,
        thumbsDown,
      };
    },
  });
</script>

