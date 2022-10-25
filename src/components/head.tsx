import { component$ } from '@builder.io/qwik';
import { useDocumentHead, useLocation } from '@builder.io/qwik-city';

/**
 * The RouterHead component is placed inside of the document `<head>` element.
 */
export const RouterHead = component$(() => {
  const head = useDocumentHead();
  const loc = useLocation();

  return (
    <>
      <title>{client.user ? client.user.username : 'Cactie'} - {head.title}</title>

      <link rel="canonical" href={loc.href} />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <link rel="icon" href={`/assets/images/${(client.user ? client.user.username : 'Cactie').replace(/ /g, '')}.webp`} />
      <meta content={head.title} property="og:title" />
      <meta content={loc.href} property="og:url" />
      <meta content={`/assets/images/${(client.user ? client.user.username : 'Cactie').replace(/ /g, '')}.webp`} property="og:image" />

      {head.meta.map((m) => (
        <meta {...m} />
      ))}

      {head.links.map((l) => (
        <link {...l} />
      ))}

      {head.styles.map((s) => (
        <style {...s.props} dangerouslySetInnerHTML={s.style} />
      ))}
    </>
  );
});
