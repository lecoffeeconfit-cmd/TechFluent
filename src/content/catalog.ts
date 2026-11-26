import {groupFor, isPublished, type GroupId, type Lesson} from './model';
import {networks} from './lessons/networks';
import {programming} from './lessons/programming';
import {dataLessons} from './lessons/data';
import {professional} from './lessons/professional';

import {interviewTopics} from './lessons/interviewTopics';
import {algorithms} from './lessons/algorithms';
import {services} from './lessons/services';
import {computerSystems,infrastructure} from './lessons/infrastructure';
import {securityPractice} from './lessons/securityPractice';
import {cloudOperations} from './lessons/cloudOperations';
import {dataPractice} from './lessons/dataPractice';
import {aiPractice} from './lessons/aiPractice';
import {engineeringPractice} from './lessons/engineeringPractice';
import {programmingPractice} from './lessons/programmingPractice';
import {webPractice,designPractice,productPractice} from './lessons/designPractice';
import {cloudDesign,serviceDesign,securityDesign,dataDesign,mobilePractice} from './lessons/platformDesign';
import {topicLessons} from './topics';

const foundation = [...networks,...programming,...dataLessons,...professional,...interviewTopics];
export const expandedLessons: Lesson[] = [
  ...algorithms,...services,...infrastructure,...computerSystems,...securityPractice,...cloudOperations,
  ...dataPractice,...aiPractice,...engineeringPractice,...programmingPractice,...webPractice,
  ...designPractice,...productPractice,...cloudDesign,...serviceDesign,...securityDesign,...dataDesign,...mobilePractice,
];
export const allLessons: Lesson[] = [...foundation,...expandedLessons];
export const publicRelease = process.env.EXPO_PUBLIC_APP_ENV === 'production';
export const lessons = publicRelease ? allLessons.filter(isPublished) : allLessons;
export const byId = Object.assign(Object.create(null),Object.fromEntries(lessons.map(lesson => [lesson.id, lesson]))) as Record<string, Lesson>;

export function lessonsForDomain(id: GroupId) {
  const alsoInDomain = new Set(groupFor(id).topics.flatMap(topic => topicLessons[topic] ?? []));
  return lessons.filter(lesson => lesson.group === id || alsoInDomain.has(lesson.id));
}

export function lessonsForTopic(topic: string) {
  return (topicLessons[topic] ?? []).flatMap(id => byId[id] ? [byId[id]] : []);
}

const searchable = lessons.map(lesson => {
  const topics = Object.entries(topicLessons).filter(([,ids]) => ids.includes(lesson.id)).map(([topic]) => topic);
  const fields = [lesson.term,lesson.title,...lesson.aliases];
  return {
    lesson,
    labels: fields.join(' ').toLowerCase(),
    haystack: [...fields,lesson.simple,lesson.group,groupFor(lesson.group).name,...topics].join(' ').toLowerCase(),
  };
});

export function searchLessons(text: string) {
  const query = text.toLowerCase().trim().replace(/\s+/g,' ');
  if (!query) return lessons;
  const words = query.split(' ');
  return searchable.filter(item => words.every(word => item.haystack.includes(word)))
    .sort((a,b) => Number(b.labels.includes(query)) - Number(a.labels.includes(query)))
    .map(item => item.lesson);
}
