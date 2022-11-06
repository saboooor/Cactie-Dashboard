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
      <title>{client.user!.username} - {head.title}</title>
      <meta content={`${client.user!.username} - ${head.title}`} property="og:title" />

      <link rel="canonical" href={loc.href} />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <link rel="icon" href={`/assets/images/${client.user!.username.replace(/ /g, '')}.webp`} />
      <meta content={loc.href} property="og:url" />
      <meta content={`/assets/images/${client.user!.username.replace(/ /g, '')}.webp`} property="og:image" />

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
