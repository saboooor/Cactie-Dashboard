import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';

export default component$(() => {
  return (
    <section class="mx-auto max-w-5xl px-6 pt-12 items-center" style={{ minHeight: 'calc(100vh - 64px)' }}>
      <br/><br/>
      <div>
        <h1 class="font-bold tracking-tight text-white text-5xl">
          <span class="text-green-400" style={{ filter: 'drop-shadow(0 0 2rem rgb(74 222 128));' }}>Privacy</span> Policy / <span class="text-luminescent-900" style={{ filter: 'drop-shadow(0 0 2rem #CB6CE6);' }}>Terms</span> of Use.
        </h1>
        <p class="mt-5 text-2xl text-gray-500">
          As of May 14th, 2023.
        </p>
      </div>
      <div class="mt-5 text-lg text-gray-500">
        <p class="text-2xl">By using Cactie's services in any form you agree to the following privacy policy / terms of use and the storage of necessary functional data.</p>
        <br/>
        <ol class="list-decimal list-inside">
          <li>
            The information that is stored
            <ol class="list-disc list-inside">
              <li>Your server's Id for server-specific data such as settings</li>
              <li>User Id for moderation and vote data</li>
              <li>The Id of messages that contain Reaction Roles</li>
              <li>All information set in the <a href="/dashboard" class="underline">dashboard</a></li>
            </ol>
          </li>
          <br/>
          <li>
            Why this information is stored and how its used
            <ol class="list-disc list-inside">
              <li>Your server's Id to keep track of which settings are for which server</li>
              <li>User Id if the user has been punished by Cactie, it gets deleted when the punishment ends</li>
              <li>The Id of messages that contain Reaction Roles for Cactie to match the associated message</li>
              <li>All information set in the <a href="/dashboard" class="underline">dashboard</a> will be deleted if Cactie gets removed from the associated server</li>
            </ol>
          </li>
          <br/>
          <li>
            Who gets this stored data?
            <ol class="list-disc list-inside">
              <li>Dashboard data is available to members of the server that have the 'Manage Server' permission.</li>
            </ol>
          </li>
          <br/>
        </ol>
        If there is need for troubleshooting or investigating suspected malicious activity, the developer may create an invite to the associated server<br/>
        The invite link is never shared with anyone else to protect your privacy.
      </div>
      <br/><br/>
      <div>
        <h1 class="font-bold tracking-tight text-white text-5xl">
          Licensing <span class="text-luminescent-900" style={{ filter: 'drop-shadow(0 0 2rem #CB6CE6);' }}>Information</span>
        </h1>
        <br/>
        <a class="mt-5 text-2xl underline text-indigo-500" style={{ filter: 'drop-shadow(0 0 2rem rgb(99 102 241));' }} href="https://github.com/saboooor/Cactie/blob/master/LICENSE">
          GNU Affero General Public License v3.0
        </a>
      </div>
      <br/><br/>
    </section>
  );
});

export const head: DocumentHead = {
  title: 'Legal',
  meta: [
    {
      name: 'description',
      content: 'Privacy Policy / Terms of Use. GNU Affero General Public License v3.0.'
    },
    {
      property: 'og:description',
      content: 'Privacy Policy / Terms of Use. GNU Affero General Public License v3.0.'
    }
  ]
}