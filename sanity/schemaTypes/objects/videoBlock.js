import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'videoBlock',
  title: 'Video (embed / URL)',
  type: 'object',
  fields: [
    defineField({
      name: 'videoUrl',
      title: 'Video URL',
      type: 'url',
      description: 'YouTube, Vimeo, or a direct file path — YouTube/Vimeo embed as iframes, everything else plays as HTML5 video.',
    }),
    defineField({name: 'caption', title: 'Caption', type: 'string'}),
    defineField({name: 'wide', title: 'Full-width', type: 'boolean', initialValue: false}),
  ],
  preview: {
    select: {caption: 'caption', videoUrl: 'videoUrl'},
    prepare({caption, videoUrl}) {
      return {title: caption || videoUrl || 'Video block'}
    },
  },
})
