import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'projectGroup',
  title: 'Project Group',
  type: 'document',
  fields: [
    defineField({
      name: 'portfolio',
      title: 'Portfolio',
      type: 'string',
      options: {list: ['systems', 'graphics'], layout: 'radio'},
      validation: (Rule) => Rule.required(),
    }),
    defineField({name: 'label', title: 'Label', type: 'string', validation: (Rule) => Rule.required()}),
    defineField({name: 'labelThai', title: 'Label (Thai)', type: 'string'}),
    defineField({
      name: 'order',
      title: 'Sort order',
      type: 'number',
      description: 'Lower shows first among groups on the same page.',
    }),
    defineField({
      name: 'projects',
      title: 'Projects',
      type: 'array',
      description: 'Drag to reorder — this order is what renders on the page.',
      of: [{type: 'reference', to: [{type: 'project'}]}],
    }),
  ],
  preview: {
    select: {title: 'label', portfolio: 'portfolio', count: 'projects.length'},
    prepare({title, portfolio, count}) {
      return {title, subtitle: `${portfolio ?? ''} — ${count ?? 0} project(s)`}
    },
  },
})
