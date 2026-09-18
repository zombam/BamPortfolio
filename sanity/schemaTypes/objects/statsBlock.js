import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'statsBlock',
  title: 'Stats',
  type: 'object',
  fields: [
    defineField({
      name: 'stats',
      title: 'Stats',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'stat',
          fields: [
            defineField({name: 'value', title: 'Value', type: 'string'}),
            defineField({name: 'label', title: 'Label', type: 'string'}),
          ],
          preview: {
            select: {value: 'value', label: 'label'},
            prepare({value, label}) {
              return {title: `${value ?? ''} — ${label ?? ''}`}
            },
          },
        },
      ],
    }),
    defineField({name: 'wide', title: 'Full-width', type: 'boolean', initialValue: false}),
  ],
  preview: {
    select: {stats: 'stats'},
    prepare({stats}) {
      return {title: `Stats (${stats?.length ?? 0})`}
    },
  },
})
