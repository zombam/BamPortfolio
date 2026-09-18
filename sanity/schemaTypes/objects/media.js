import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'media',
  title: 'Media',
  type: 'object',
  fields: [
    defineField({
      name: 'mediaType',
      title: 'Type',
      type: 'string',
      options: {list: ['image', 'video', 'gif']},
      initialValue: 'image',
    }),
    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
      options: {hotspot: true},
      hidden: ({parent}) => parent?.mediaType === 'video',
    }),
    defineField({
      name: 'video',
      title: 'Video file',
      type: 'file',
      options: {accept: 'video/*'},
      hidden: ({parent}) => parent?.mediaType !== 'video',
    }),
    defineField({
      name: 'caption',
      title: 'Caption',
      type: 'string',
    }),
  ],
  preview: {
    select: {media: 'image', caption: 'caption', mediaType: 'mediaType'},
    prepare({media, caption, mediaType}) {
      return {title: caption || mediaType, media}
    },
  },
})
