import { Picker } from 'emoji-mart';
import { Slot, component$, useStore, useVisibleTask$ } from '@builder.io/qwik';
import { Button } from './Button';

export default component$(({ id, emojiPickerProps, onEmojiSelect$ }: any) => {
  useVisibleTask$(() => {
    const picker = new Picker({
      onEmojiSelect: onEmojiSelect$,
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
      ...emojiPickerProps,
    });
    const div = document.getElementById('emoji-picker');
    div?.append(picker as any);
  });

  const store = useStore({
    hidden: true,
  });

  return <>
    <div class="flex items-center pb-3">
      <label for={id} class="mr-2 text-xl">
        <Slot />
      </label>
      <Button id={id} onClick$={() => store.hidden = !store.hidden}>😃</Button>
    </div>
    <div id="emoji-picker" class={{
      'absolute top-32 right-0': true,
      'hidden': store.hidden,
    }} />
  </>;
});