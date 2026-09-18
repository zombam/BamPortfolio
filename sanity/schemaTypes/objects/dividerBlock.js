import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'dividerBlock',
  title: 'Divider',
  type: 'object',
  fields: [
    defineField({name: 'label', title: 'Section label (optional)', type: 'string'}),
    defineField({name: 'wide', title: 'Full-width', type: 'boolean', initialValue: false}),
  ],
  preview: {
    select: {label: 'label'},
    prepare({label}) {
      return {title: label ? `Divider — ${label}` : 'Divider'}
    },
  },
})
