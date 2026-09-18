import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'imageBlock',
  title: 'Image / Video',
  type: 'object',
  fields: [
    defineField({name: 'media', title: 'Media', type: 'media'}),
    defineField({name: 'wide', title: 'Full-width', type: 'boolean', initialValue: false}),
  ],
  preview: {
    select: {media: 'media.image', caption: 'media.caption'},
    prepare({media, caption}) {
      return {title: caption || 'Image block', media}
    },
  },
})
