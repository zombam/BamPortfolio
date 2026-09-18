import {defineField, defineType} from 'sanity'

const pageMeta = (name, title) =>
  defineField({
    name,
    title,
    type: 'object',
    fields: [
      defineField({name: 'pageTitle', title: 'Page title', type: 'string'}),
      defineField({name: 'heroTagline', title: 'Hero tagline', type: 'string'}),
      defineField({name: 'heroBio', title: 'Hero bio', type: 'text'}),
      defineField({
        name: 'heroTags',
        title: 'Hero tags',
        type: 'array',
        of: [{type: 'string'}],
        options: {layout: 'tags'},
      }),
    ],
  })

export default defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  fields: [pageMeta('systemsMeta', 'Systems page meta'), pageMeta('graphicsMeta', 'Graphics page meta')],
  preview: {
    prepare() {
      return {title: 'Site Settings'}
    },
  },
})
