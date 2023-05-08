import { component$, Slot, useStore } from '@builder.io/qwik';
import { useNavigate } from '@builder.io/qwik-city';

import LoadingIcon from '~/components/icons/LoadingIcon';

const classes = {
  primary: 'bg-purple-700 hover:bg-purple-600 focus:bg-purple-600',
  secondary: 'bg-gray-700 hover:bg-gray-600 focus:bg-gray-600',
  danger: 'bg-red-700 hover:bg-red-600 focus:bg-red-600',
  success: 'bg-green-700 hover:bg-green-600 focus:bg-green-600',
  warning: 'bg-yellow-700 hover:bg-yellow-600 focus:bg-yellow-600',
  info: 'bg-blue-700 hover:bg-blue-600 focus:bg-blue-600',
};

export const Button = component$((props: any) => {
  const color = props.color ? classes[props.color as keyof typeof classes] : classes.secondary;
  return (
    <button {...props} class={`transition ease-in-out text-lg ${color} text-gray-50 rounded-md px-3 py-2 ${props.extraClass}`}>
      <Slot />
    </button>
  );
});

export const SPAButton = component$((props: any) => {
  const color = props.color ? classes[props.color as keyof typeof classes] : classes.secondary;
  const store = useStore({
    loading: false,
  });
  const nav = useNavigate();
  return (
    <div class="flex flex-cols">
      <button {...props} onClick$={async () => { store.loading = true; await nav(props.href); store.loading = false; }} class={`transition ease-in-out text-lg ${color} text-gray-50 rounded-md px-3 py-2 ${props.extraClass}`}>
        <div class="flex items-center">
          <Slot /> <LoadingIcon extraClass={`${!store.loading && 'hidden'}`}/>
        </div>
      </button>
    </div>
  );
});

export const ExternalButton = component$((props: any) => {
  const color = props.color ? classes[props.color as keyof typeof classes] : classes.secondary;
  return (
    <a {...props} class={`transition ease-in-out text-lg ${color} text-gray-50 rounded-md px-3 py-2 ${props.extraClass}`}>
      <Slot />
    </a>
  );
});