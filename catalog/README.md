# Catalog

One small file per published video. Metadata and one link, nothing else: no lyrics, no translations, no media.

| Field | Meaning |
| --- | --- |
| `number` | Order of publication. 1 is the first video. |
| `title` | The song's title in its own spelling. |
| `title_en` | The title in the second language, when the video gives one. Optional. |
| `artist` | The original artist or artists, in their own spelling. |
| `languages` | The languages on screen. The song's language comes first, the translation last. |
| `youtube` | The lyric video. |
| `published` | When the video was published, in UTC. A full date where the channel's feed gives one, a month where only the month could be confirmed, `null` where neither could. |
| `note` | One line on where the song comes from or how it was translated. |

Language codes: `en` English, `es` Spanish, `es-AR` Spanish as spoken in Argentina, `fr` French, `ja` Japanese, `ru` Russian.

The table in the main README is written from these files:

```sh
node tools/catalog.mjs          # check the files and rewrite the table
node tools/catalog.mjs --check  # check only
```

The check refuses any field outside the list above and any text longer than one short line.
