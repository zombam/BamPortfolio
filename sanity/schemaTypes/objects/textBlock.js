import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'textBlock',
  title: 'Text',
  type: 'object',
  fields: [
    defineField({name: 'heading', title: 'Heading (optional)', type: 'string'}),
    defineField({
      name: 'paragraphs',
      title: 'Paragraphs',
      type: 'array',
      of: [{type: 'text'}],
    }),
    defineField({name: 'wide', title: 'Full-width', type: 'boolean', initialValue: false}),
  ],
  preview: {
    select: {heading: 'heading', paragraphs: 'paragraphs'},
    prepare({heading, paragraphs}) {
      return {title: heading || paragraphs?.[0]?.slice(0, 40) || 'Text block'}
    },
  },
})
