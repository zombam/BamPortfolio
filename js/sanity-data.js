/* Fetches all portfolio content from Sanity and reshapes it into the exact
   same object shape portfolio.json used to have, so every page's existing
   render code (index/systems/graphics/project-template) works unchanged —
   only the fetch call at the top of each loader script needs to swap to
   PORTFOLIO_DATA.fetchPortfolio(). Edit PROJECT_ID/DATASET below if you ever
   move to a different Sanity project. */
const PORTFOLIO_DATA = (function () {
  const PROJECT_ID = 'l4ak4e6v';
  const DATASET = 'production';
  const API_VERSION = '2024-01-01';

  const BLOCKS = `
    blocks[]{
      "type": select(
        _type=="textBlock" => "text",
        _type=="imageBlock" => "image",
        _type=="imagePairBlock" => "image-pair",
        _type=="videoBlock" => "video",
        _type=="pullquoteBlock" => "pullquote",
        _type=="statsBlock" => "stats",
        _type=="dividerBlock" => "divider"
      ),
      wide,
      heading,
      paragraphs,
      text,
      source,
      label,
      "stats": stats[]{value, label},
      "src": select(
        _type=="videoBlock" => videoUrl,
        _type=="imageBlock" && media.mediaType=="video" => media.video.asset->url,
        _type=="imageBlock" => media.image.asset->url
      ),
      "srcType": select(_type=="videoBlock" => "video", _type=="imageBlock" => media.mediaType),
      "caption": select(_type=="videoBlock" => caption, _type=="imageBlock" => media.caption),
      "src1": select(media1.mediaType=="video" => media1.video.asset->url, media1.image.asset->url),
      "src1Type": media1.mediaType,
      "caption1": media1.caption,
      "src2": select(media2.mediaType=="video" => media2.video.asset->url, media2.image.asset->url),
      "src2Type": media2.mediaType,
      "caption2": media2.caption
    }
  `;

  const PROJECT_FIELDS = `
    "id": slug.current,
    title,
    latin,
    cat,
    year,
    "src": select(hero.mediaType=="video" => hero.video.asset->url, hero.image.asset->url),
    "srcType": hero.mediaType,
    desc,
    shortDesc,
    tools,
    role,
    tags,
    "link": select(defined(externalLink) => externalLink, "project-template.html?id=" + slug.current),
    visible,
    featuredHome,
    status,
    statusLabel,
    badge,
    ${BLOCKS}
  `;

  const QUERY = `{
    "wip": *[_type=="wipItem"] | order(order asc) {
      "type": media.mediaType,
      "src": select(media.mediaType=="video" => media.video.asset->url, media.image.asset->url),
      "thumb": thumb.asset->url,
      caption,
      tag,
      date
    },
    "systems": {
      "meta": *[_id=="siteSettings"][0].systemsMeta,
      "featured": *[_type=="project" && portfolio=="systems" && isFeatured==true][0]{ ${PROJECT_FIELDS} },
      "groups": *[_type=="projectGroup" && portfolio=="systems"] | order(order asc) {
        label, labelThai,
        "projects": projects[]->{ ${PROJECT_FIELDS} }
      }
    },
    "graphics": {
      "meta": *[_id=="siteSettings"][0].graphicsMeta,
      "featured": *[_type=="project" && portfolio=="graphics" && isFeatured==true][0]{ ${PROJECT_FIELDS} },
      "groups": *[_type=="projectGroup" && portfolio=="graphics"] | order(order asc) {
        label, labelThai,
        "projects": projects[]->{ ${PROJECT_FIELDS} }
      }
    }
  }`;

  let cached = null;

  function fetchPortfolio() {
    if (cached) return cached;
    const url = `https://${PROJECT_ID}.api.sanity.io/v${API_VERSION}/data/query/${DATASET}?query=${encodeURIComponent(QUERY)}`;
    cached = fetch(url)
      .then((r) => r.json())
      .then((r) => {
        if (r.error) throw new Error(r.error.description || 'Sanity query failed');
        return r.result;
      })
      .catch((err) => { cached = null; throw err; });
    return cached;
  }

  return { fetchPortfolio };
})();
