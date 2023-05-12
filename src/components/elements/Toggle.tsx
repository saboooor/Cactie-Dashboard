import { component$, Slot } from '@builder.io/qwik';

export default component$((props: any) => {
  return (
    <div class="flex gap-3 items-center">
      <label class="inline-flex relative items-center cursor-pointer">
        <input type="checkbox" {...props} class="sr-only peer" />
        <div class="transition ease-in-out w-12 h-7 rounded-md peer bg-gray-700 hover:bg-gray-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-gray-600 hover:after:bg-gray-500 peer-checked:after:bg-purple-600 after:rounded-md after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-900" />
      </label>
      {!props.nolabel &&
        <label for={props.id} class="text-gray-100">
          <Slot/>
        </label>
      }
    </div>
  );
});