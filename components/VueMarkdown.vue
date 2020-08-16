<template>
  <div
    class="mkdjs"
    v-html="compiledMarkdown"
  ></div>
</template>

<script>
  import marked from 'marked'

  function renderMarkDown ( data ) {
    const renderer = new marked.Renderer();
    const linkRenderer = renderer.link;
    const imgRenderer = renderer.image;

    renderer.link = ( href, title, text ) => {
      const html = linkRenderer.call( renderer, href, title, text );
      return html.replace(/^<a /, '<a target="_blank" rel="ugc" ');
    };

    const domainRe = /https?:\/\/((?:[\w\d-]+\.)+[\w\d]{2,})/i;
    const approvedDomains = [
      'bitwave.tv',
      'cdn.bitwave.tv',
      'imgur.com',
      'i.imgur.com',
      'i.stack.imgur.com',
      'chatemotes.neocities.org',
    ];

    renderer.image = ( href, title, text ) => {
      const getDomain = ( domain ) => {
        return domainRe.exec( domain )[1];
      };

      if ( approvedDomains.includes( getDomain( href ) ) ) {
        return imgRenderer.call( renderer, href, title, text );
      }

      return linkRenderer.call(  renderer, href, title, text ) + ` <span class='overline'>(image)</span>`;
    };

    return marked( data, { renderer: renderer, sanitize: true, breaks: true } );
  }

  export default {
    props: {
      source: { default: '', type: String },
    },
    computed: {
      compiledMarkdown () {
        // return marked(this.source, { sanitize: true, breaks: true });
        return renderMarkDown ( this.source );
      }
    },
  }
</script>

<style lang="scss">
  .mkdjs {
    .code,
    code,
    pre {
      white-space: pre;
      overflow-x: auto;
      display: inline-block;
      max-width: 100%;
    }
  }
</style>
