<script setup lang="ts">
import { ref, watchEffect } from 'vue';
import { useVModel } from '@vueuse/core'
import { cn } from '@/lib/utils'
import { textareaVariants } from './index'

interface Props {
  variant?: NonNullable<Parameters<typeof textareaVariants>[0]>['variant']
  defaultValue?: string | number
  modelValue?: string | number
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
})

const emits = defineEmits<{
  (e: 'update:modelValue', payload: string | number): void
}>()

const modelValue = useVModel(props, 'modelValue', emits, {
  passive: true,
  defaultValue: props.defaultValue,
})

const textareaRef = ref(null);

const adjustTextareaHeight = () => {
  if (props.variant === 'expandable') {
    const textarea = textareaRef.value;
    if (textarea) {
      textarea.style.height = 'auto';
      const maxHeight = 200;
      textarea.style.height = Math.min(textarea.scrollHeight, maxHeight) + 'px';
    }
  }
}

watchEffect(() => {
  adjustTextareaHeight(); // Adjust height when modelValue changes
})

const handleKeydown = (event) => {
  if (event.key === 'Enter' && !event.shiftKey && props.variant === 'expandable') {
    adjustTextareaHeight();
  }
}
</script>

<template>
  <textarea 
    v-model="modelValue" 
    ref="textareaRef"
    :class="cn(textareaVariants({ variant: props.variant }), $attrs.class ?? '')"
    @input="adjustTextareaHeight"
    @keydown="handleKeydown"
  />
</template>

