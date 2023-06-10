import { Picker } from 'emoji-mart';
import { Slot, component$, useVisibleTask$ } from '@builder.io/qwik';
import { Button } from './Button';

export default component$(({ id, emoji, nolabel, onChange$ }: any) => {
  return <>
    <div class="flex items-center">
      {!nolabel && <label for={id} class="mr-2 text-xl"><Slot /></label>}
      <Button id={id} onClick$={(event: any) => {
        const picker = document.getElementById('emoji-picker');
        if (picker) {
          document.getElementById('emoji-picker')?.classList.remove('hidden');
          picker.style.left = `${event.pageX || 0}px`;
          picker.style.top = `${event.pageY || 0}px`;
          event.target.classList.add('emoji-picker-active');
        }
        else {
          console.error('Emoji picker not found!!');
        }
      }} onChange$={onChange$} value={emoji}>{isNaN(emoji) ? emoji ?? '😃' : <img src={`https://cdn.discordapp.com/emojis/${emoji}`} width={24} height={24}/>}</Button>
    </div>
  </>;
});

export const EmojiPicker = component$(({ props }: any) => {
  useVisibleTask$(() => {
    const picker = new Picker({
      onEmojiSelect: (emoji: any) => {
        emoji = emoji.native ?? emoji.id;
        const button = document.querySelector('.emoji-picker-active') as HTMLButtonElement;
        if (!button) return;
        button.innerHTML = isNaN(emoji) ? emoji ?? '😃' : `<img src="https://cdn.discordapp.com/emojis/${emoji}" width="24" height="24"></img>`;
        button.setAttribute('value', emoji);
        button.dispatchEvent(new Event('change'));
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
      icons: 'outline',
      ...props,
    });
    const div = document.getElementById('emoji-picker');
    div?.append(picker as any);
    document.addEventListener('click', (event) => {
      const picker = document.getElementById('emoji-picker');
      if (picker && !picker.contains(event.target as any)) {
        picker.classList.add('hidden');
        const active = document.querySelectorAll('.emoji-picker-active');
        active.forEach((element) => element.classList.remove('emoji-picker-active'));
      }
    });
  });
  return <div id={'emoji-picker'} class="hidden absolute z-10" />;
});