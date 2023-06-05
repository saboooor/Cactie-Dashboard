import { Picker } from 'emoji-mart';
import { Slot, component$, useVisibleTask$ } from '@builder.io/qwik';
import { Button } from './Button';

export default component$(({ id, emoji, nolabel }: any) => {
  return <>
    <div class="flex items-center">
      {!nolabel && <label for={id} class="mr-2 text-xl"><Slot /></label>}
      <Button id={id} onClick$={(event: any) => {
        const picker = document.getElementById('emoji-picker');
        if (picker) {
          document.getElementById('emoji-picker')?.classList.toggle('hidden');
          picker.style.left = `${event.clientX || 0}px`;
          picker.style.top = `${event.clientY || 0}px`;
        }
        else {
          console.error('Emoji picker not found!!');
        }
      }}>{emoji ?? '😃'}</Button>
    </div>
  </>;
});

export const EmojiPicker = component$(({ props }: any) => {
  useVisibleTask$(() => {
    const picker = new Picker({
      onEmojiSelect: (emoji: any) => {
        console.log(emoji);
      },
      navPosition: 'bottom',
      noCountryFlags: false,
      previewPosition: 'none',
      set: 'twitter',
      skinTonePosition: 'search',
      theme: 'dark',
      categories: [
        'frequent',
        'custom',
        'people',
        'nature',
        'foods',
        'activity',
        'places',
        'objects',
        'symbols',
        'flags',
      ],
      ...props,
    });
    const div = document.getElementById('emoji-picker');
    div?.append(picker as any);
    document.addEventListener('click', (event) => {
      const picker = document.getElementById('emoji-picker');
      if (picker && !picker.contains(event.target as any)) {
        picker.classList.add('hidden');
      }
    });
  });
  return <div id={'emoji-picker'} class="hidden fixed z-10" />;
});