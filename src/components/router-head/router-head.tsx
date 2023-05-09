import { component$ } from '@builder.io/qwik';
import { useDocumentHead, useLocation } from '@builder.io/qwik-city';

// @ts-ignore
import iconPNG16 from '~/components/images/Cactie.png?width=16&height=16';
// @ts-ignore
import iconPNG32 from '~/components/images/Cactie.png?width=32&height=32';
// @ts-ignore
import iconPNG96 from '~/components/images/Cactie.png?width=96&height=96';
// @ts-ignore
import iconJPG16 from '~/components/images/Cactie.png?jpeg&width=16&height=16';
// @ts-ignore
import iconJPG32 from '~/components/images/Cactie.png?jpeg&width=32&height=32';
// @ts-ignore
import iconJPG96 from '~/components/images/Cactie.png?jpeg&width=96&height=96';

/**
 * The RouterHead component is placed inside of the document `<head>` element.
 */
export const RouterHead = component$(() => {
  const head = useDocumentHead();
  const loc = useLocation();

  return (
    <>
      <title>{`Cactie: ${head.title}`}</title>
      <meta content={`Cactie: ${head.title}`} property="og:title"/>
      <meta content="#E6AAF7" name="theme-color"/>

      <link rel="canonical" href={loc.url.href} />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />

      <link rel="icon" href={iconJPG16} type='image/jpeg' sizes="16x16"/>
      <link rel="icon" href={iconJPG32} type='image/jpeg' sizes="32x32"/>
      <link rel="icon" href={iconJPG96} type='image/jpeg' sizes="96x96"/>
      <link rel="icon" href={iconPNG16} type='image/png' sizes="16x16"/>
      <link rel="icon" href={iconPNG32} type='image/png' sizes="32x32"/>
      <link rel="icon" href={iconPNG96} type='image/png' sizes="96x96"/>

      {head.meta.map((m) => (
        <meta key={m.key} {...m} />
      ))}

      {head.links.map((l) => (
        <link key={l.key} {...l} />
      ))}

      {head.styles.map((s) => (
        <style key={s.key} {...s.props} dangerouslySetInnerHTML={s.style} />
      ))}
    </>
  );
});
