import {choice, fill, interview, order, type Exercise, type GroupId, type Lesson, type QA, type SourceKey, type Stage} from '../model';

interface Round {
  discussion: QA;
  criterion: string;
  check: Exercise;
}

// Each round pairs an open interview question with a separately graded transfer question.
export function round(question: string, workedAnswer: string, criterion: string, check: string,
  options: string[], correct?: number | number[], fixture?: string): Round {
  const exercise = Array.isArray(correct)
    ? {...order(check, options, correct, criterion, workedAnswer), fixture}
    : correct === undefined
      ? fill(check, options, criterion, workedAnswer, fixture)
      : choice(check, options, correct, criterion, workedAnswer, fixture);
  return {discussion: [question, workedAnswer], criterion, check: exercise};
}

interface CaseStudy {
  id: string; term: string; title: string; stage: Stage;
  prerequisites: string[]; related: string[]; refs: SourceKey[]; aliases: string[];
  why: string; analogy: string; mechanism: string; mistake: string; tradeoff: string; security: string;
  entry: Round; diagnosis: Round; design: Round;
  code?: Lesson['code']; alternateCode?: Lesson['alternateCode'];
}

export function caseStudies(group: GroupId, studies: CaseStudy[]): Lesson[] {
  return studies.map(({entry, diagnosis, design, mechanism, ...content}) => ({
    ...content, group, minutes: content.stage === 'Foundational' ? 5 : 7,
    simple: entry.discussion[1], technical: mechanism,
    example: diagnosis.discussion.join(' '), practice: design.discussion[1],
    checks: [entry.check, diagnosis.check, design.check],
    interview: interview(entry.discussion, diagnosis.discussion, design.discussion,
      [entry.criterion, diagnosis.criterion, design.criterion]),
  }));
}
