import { component$, useClientEffect$ } from '@builder.io/qwik';

export default component$(() => {
	useClientEffect$(async () => {
	  const res = await fetch('/user');
    const json = await res.json();
    if (!json) document.getElementById('loggedout')?.classList.replace('hidden', 'flex');
    else {
      const loggedin: any = document.getElementById('loggedin');
      const pfp: any = document.getElementById('pfp');
      const tag: any = document.getElementById('tag');
      pfp.src = json.pfp;
      tag.innerText = json.tag;
      loggedin.style.backgroundColor = json.accent
      loggedin.classList.replace('hidden', 'flex');
    }
	});
  return (
    <header>
      <nav class="z-10 fixed top-0 w-screen my-3">
        <div class="mx-auto max-w-7xl px-6 lg:px-8">
          <div class="relative flex h-16 items-center justify-between">
            <div class="flex flex-1 items-center justify-start sm:items-stretch sm:hidden">
              <button type="button" id="mobile-menu-button" onClick$={() => document.getElementById('mobile-menu')?.classList.toggle("hidden")} class="inline-flex items-center justify-center rounded-full p-2 text-gray-400 bg-gray-900 hover:text-white focus:outline-none focus:bg-gray-800" aria-controls="mobile-menu" aria-expanded="false">
                <span class="sr-only">Open main menu</span>
                <svg class="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
                <svg class="hidden h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div class="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
              <a href="/" class="text-gray-300 bg-gray-900 hover:bg-gray-800 hover:text-white hover:drop-shadow-2xl pl-2 pr-3 py-2 rounded-full text-sm font-medium flex items-center">
                <img class="h-8 w-8 mr-3 rounded-full" src="/assets/images/Cactie.webp" alt="Cactie" />
                Cactie
              </a>
            </div>
            <div class="flex-1 items-center hidden justify-center sm:flex">
              <div class="sm:ml-6 sm:block">
                <div class="flex space-x-4">
                  <a href="/dashboard" class="text-gray-300 hover:bg-gray-800 hover:text-white hover:drop-shadow-2xl px-3 py-2 rounded-full text-sm font-medium">Dashboard</a>
                  <a href="#" class="text-gray-300 hover:bg-gray-800 hover:text-white hover:drop-shadow-2xl px-3 py-2 rounded-full text-sm font-medium">Support</a>
                  <a href="/legal" class="text-gray-300 hover:bg-gray-800 hover:text-white hover:drop-shadow-2xl px-3 py-2 rounded-full text-sm font-medium">Legal</a>
                  <a href="/invite" class="text-gray-300 hover:bg-gray-800 hover:text-white hover:drop-shadow-2xl px-3 py-2 rounded-full text-sm font-medium">Invite</a>
                </div>
              </div>
            </div>
            <div class="flex flex-1 items-center justify-end sm:items-stretch">
              <a href="/logout" id="loggedin" class="text-gray-300 hover:bg-gray-800 hover:text-white hover:drop-shadow-2xl sm:px-3 sm:py-2 rounded-full text-sm font-medium hidden items-center">
                <img class="h-8 w-8 sm:mr-3 rounded-full" id="pfp" src="" alt="User Avatar" />
                <span class="hidden sm:flex" id="tag"></span>
              </a>
              <a href="/login" id="loggedout" class="bg-indigo-700 hover:bg-indigo-600 text-white hover:drop-shadow-2xl px-4 py-2 rounded-full text-sm font-medium hidden items-center">
                Login
              </a>
            </div>
          </div>
        </div>

        <div class="hidden" id="mobile-menu">
          <div class="space-y-1 py-3 justify-center items-center flex gap-2">
            <a href="/dashboard" class="text-gray-300 bg-gray-800 hover:bg-gray-700 hover:text-white hover:drop-shadow-2xl px-4 py-2 rounded-full text-base font-medium">Dashboard</a>
            <a href="#" class="text-gray-300 bg-gray-800 hover:bg-gray-700 hover:text-white hover:drop-shadow-2xl px-4 py-2 rounded-full text-base font-medium">Support</a>
            <a href="/legal" class="text-gray-300 bg-gray-800 hover:bg-gray-700 hover:text-white hover:drop-shadow-2xl px-4 py-2 rounded-full text-base font-medium">Legal</a>
            <a href="/invite" class="text-gray-300 bg-gray-800 hover:bg-gray-700 hover:text-white hover:drop-shadow-2xl px-4 py-2 rounded-full text-base font-medium">Invite</a>
          </div>
        </div>
      </nav>
    </header>
  );
});
