import { irregularVerbs } from './irregularVerbs'

export function pastParticiple(infinitive: string): string {
  const lowerInfinitive = infinitive.toLowerCase()
  const irregularForm = irregularVerbs.get(lowerInfinitive)

  return irregularForm ? irregularForm : regular(lowerInfinitive)
}

function regular(present: string): string {
  return present + (present.endsWith('e') ? '' : 'e') + 'd'
}
