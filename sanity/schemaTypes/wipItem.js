import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'wipItem',
  title: 'WIP Item',
  type: 'document',
  fields: [
    defineField({name: 'media', title: 'Media', type: 'media', validation: (Rule) => Rule.required()}),
    defineField({
      name: 'thumb',
      title: 'Thumbnail (video items only)',
      type: 'image',
      hidden: ({document}) => document?.media?.mediaType !== 'video',
    }),
    defineField({name: 'caption', title: 'Caption', type: 'string'}),
    defineField({name: 'tag', title: 'Tag', type: 'string'}),
    defineField({name: 'date', title: 'Date label', type: 'string', description: 'e.g. "Dec 2025" — freeform, matches the old JSON.'}),
    defineField({
      name: 'order',
      title: 'Sort order',
      type: 'number',
      description: 'Lower shows first. Optional — leave blank and reorder in the Studio list view instead.',
    }),
  ],
  preview: {
    select: {caption: 'caption', media: 'media.image', tag: 'tag'},
    prepare({caption, media, tag}) {
      return {title: caption || 'WIP item', subtitle: tag, media}
    },
  },
})
