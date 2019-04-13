<template>
  <div v-html="compiledMarkdown"></div>
</template>

<script>
  import marked from 'marked'

  export default {
    props: {
      source: { default: '', type: String },
    },
    computed: {
      compiledMarkdown: function () {
        return marked(this.source, { sanitize: true, breaks: true })
      }
    },
  }
</script>
