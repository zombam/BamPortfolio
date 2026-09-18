import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'imagePairBlock',
  title: 'Image Pair',
  type: 'object',
  fields: [
    defineField({name: 'media1', title: 'Image 1', type: 'media'}),
    defineField({name: 'media2', title: 'Image 2', type: 'media'}),
    defineField({name: 'wide', title: 'Full-width', type: 'boolean', initialValue: false}),
  ],
  preview: {
    select: {media: 'media1.image'},
    prepare({media}) {
      return {title: 'Image pair', media}
    },
  },
})
