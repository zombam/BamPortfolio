import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'pullquoteBlock',
  title: 'Pullquote',
  type: 'object',
  fields: [
    defineField({name: 'text', title: 'Quote text', type: 'text'}),
    defineField({name: 'source', title: 'Source / attribution', type: 'string'}),
    defineField({name: 'wide', title: 'Full-width', type: 'boolean', initialValue: false}),
  ],
  preview: {
    select: {text: 'text'},
    prepare({text}) {
      return {title: text?.slice(0, 40) || 'Pullquote'}
    },
  },
})
