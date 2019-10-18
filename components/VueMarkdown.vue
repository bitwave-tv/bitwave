<template>
  <div v-html="compiledMarkdown"></div>
</template>

<script>
  import marked from 'marked'

  function renderMarkDown ( data ) {
    const renderer = new marked.Renderer();
    const linkRenderer = renderer.link;
    renderer.link = ( href, title, text ) => {
      const html = linkRenderer.call( renderer, href, title, text );
      return html.replace(/^<a /, '<a target="_blank" rel="nofollow" ');
    };
    return marked( data, { renderer: renderer, sanitize: true, breaks: true } );
  }

  export default {
    props: {
      source: { default: '', type: String },
    },
    computed: {
      compiledMarkdown: function () {
        // return marked(this.source, { sanitize: true, breaks: true });
        return renderMarkDown ( this.source );
      }
    },
  }
</script>
