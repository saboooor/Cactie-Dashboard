import { component$ } from '@builder.io/qwik';
import { ChatboxOutline, HappyOutline, NewspaperOutline, SettingsOutline, ShieldCheckmarkOutline, TerminalOutline, TicketOutline } from 'qwik-ionicons';
import { Link } from '@builder.io/qwik-city';

export default component$(({ guild }: any) => {
  return (
    <div class="grid grid-cols-12 items-center gap-3 my-4 whitespace-nowrap fill-current">
      <Link href={`/dashboard/${guild.id}/general`} class="col-span-4 flex flex-1 gap-4 justify-center bg-gray-850 border border-red-400/10 hover:bg-red-400/10 transition-all rounded-lg py-3 px-4 text-center fill-current">
        <SettingsOutline width='24' />
        General
      </Link>
      <Link href={`/dashboard/${guild.id}/tickets`} class="col-span-4 flex flex-1 gap-4 justify-center bg-gray-850 border border-orange-400/10 hover:bg-orange-400/10 transition-all rounded-lg py-3 px-4 text-center fill-current">
        <TicketOutline width='24' />
        Tickets
      </Link>
      <Link href={`/dashboard/${guild.id}/moderation`} class="col-span-4 flex flex-1 gap-4 justify-center bg-gray-850 border border-yellow-400/10 hover:bg-yellow-400/10 transition-all rounded-lg py-3 px-4 text-center fill-current">
        <ShieldCheckmarkOutline width='24' />
        Moderation
      </Link>
      <Link href={`/dashboard/${guild.id}/reactions`} class="col-span-3 flex flex-1 gap-4 justify-center bg-gray-850 border border-green-400/10 hover:bg-green-400/10 transition-all rounded-lg py-3 px-4 text-cente fill-currentr">
        <ChatboxOutline width='24' />
        Reactions
      </Link>
      <Link href={`/dashboard/${guild.id}/auditlogs`} class="col-span-3 flex flex-1 gap-4 justify-center bg-gray-850 border border-blue-400/10 hover:bg-blue-400/10 transition-all rounded-lg py-3 px-4 text-center fill-current">
        <NewspaperOutline width='24' />
        Audit Logs
      </Link>
      <Link href={`/dashboard/${guild.id}/reactionroles`} class="col-span-3 flex flex-1 gap-4 justify-center bg-gray-850 border border-purple-400/10 hover:bg-purple-400/10 transition-all rounded-lg py-3 px-4 text-center fill-current">
        <HappyOutline width='24' />
        Reaction Roles
      </Link>
      <Link href={`/dashboard/${guild.id}/customcmds`} class="col-span-3 flex flex-1 gap-4 justify-center bg-gray-850 border border-pink-400/10 hover:bg-pink-400/10 transition-all rounded-lg py-3 px-4 text-center fill-current">
        <TerminalOutline width='24' />
        Custom Commands
      </Link>
    </div>
  );
});