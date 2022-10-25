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


      {head.meta.map((m) => (
        <meta {...m} />
      ))}

      {head.links.map((l) => (
        <link {...l} />
      ))}

      <meta content="Embed Title" property="og:title" />
      <meta content="Site Description" property="og:description" />
      <meta content="https://embed.com/this-is-the-site-url" property="og:url" />
      <meta content={`/assets/images/${(client.user ? client.user.username : 'Cactie').replace(/ /g, '')}.webp`} property="og:image" />
      <meta content="#43B581" data-react-helmet="true" name="theme-color" />

      {head.styles.map((s) => (
        <style {...s.props} dangerouslySetInnerHTML={s.style} />
      ))}
    </>
  );
});
