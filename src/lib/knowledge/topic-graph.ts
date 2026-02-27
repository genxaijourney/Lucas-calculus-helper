import { TopicNode, TopicCategory } from '../types/tutor';
import { MASTERY_THRESHOLD_READY } from '../constants';

interface TopicDefinition {
  id: string;
  name: string;
  category: TopicCategory;
  prerequisites: string[];
}

const TOPIC_DEFINITIONS: TopicDefinition[] = [
  // Pre-Algebra (5 topics)
  { id: 'fractions', name: 'Fractions & Decimals', category: 'pre_algebra', prerequisites: [] },
  { id: 'integers', name: 'Integer Operations', category: 'pre_algebra', prerequisites: [] },
  { id: 'ratios', name: 'Ratios & Proportions', category: 'pre_algebra', prerequisites: ['fractions'] },
  { id: 'exponents_intro', name: 'Exponents & Roots', category: 'pre_algebra', prerequisites: ['integers'] },
  { id: 'order_of_ops', name: 'Order of Operations', category: 'pre_algebra', prerequisites: ['integers', 'fractions'] },

  // Algebra (6 topics)
  { id: 'variables', name: 'Variables & Expressions', category: 'algebra', prerequisites: ['order_of_ops'] },
  { id: 'linear_equations', name: 'Linear Equations', category: 'algebra', prerequisites: ['variables'] },
  { id: 'inequalities', name: 'Inequalities', category: 'algebra', prerequisites: ['linear_equations'] },
  { id: 'systems', name: 'Systems of Equations', category: 'algebra', prerequisites: ['linear_equations'] },
  { id: 'quadratics', name: 'Quadratic Equations', category: 'algebra', prerequisites: ['variables', 'exponents_intro'] },
  { id: 'polynomials', name: 'Polynomials', category: 'algebra', prerequisites: ['quadratics'] },

  // Precalculus (5 topics)
  { id: 'functions', name: 'Functions & Graphs', category: 'precalculus', prerequisites: ['linear_equations', 'quadratics'] },
  { id: 'trig', name: 'Trigonometry', category: 'precalculus', prerequisites: ['functions', 'ratios'] },
  { id: 'exponential_log', name: 'Exponentials & Logarithms', category: 'precalculus', prerequisites: ['functions', 'exponents_intro'] },
  { id: 'sequences', name: 'Sequences & Series', category: 'precalculus', prerequisites: ['functions'] },
  { id: 'complex_numbers', name: 'Complex Numbers', category: 'precalculus', prerequisites: ['quadratics'] },

  // Calculus (6 topics)
  { id: 'limits', name: 'Limits & Continuity', category: 'calculus', prerequisites: ['functions'] },
  { id: 'derivatives', name: 'Derivatives', category: 'calculus', prerequisites: ['limits'] },
  { id: 'diff_rules', name: 'Differentiation Rules', category: 'calculus', prerequisites: ['derivatives'] },
  { id: 'applications_deriv', name: 'Applications of Derivatives', category: 'calculus', prerequisites: ['diff_rules'] },
  { id: 'integrals', name: 'Integrals', category: 'calculus', prerequisites: ['derivatives'] },
  { id: 'applications_int', name: 'Applications of Integrals', category: 'calculus', prerequisites: ['integrals'] },

  // Linear Algebra (4 topics)
  { id: 'vectors', name: 'Vectors', category: 'linear_algebra', prerequisites: ['systems'] },
  { id: 'matrices', name: 'Matrices', category: 'linear_algebra', prerequisites: ['vectors'] },
  { id: 'determinants', name: 'Determinants', category: 'linear_algebra', prerequisites: ['matrices'] },
  { id: 'eigenvalues', name: 'Eigenvalues & Eigenvectors', category: 'linear_algebra', prerequisites: ['determinants'] },

  // Differential Equations (4 topics)
  { id: 'ode_intro', name: 'Intro to ODEs', category: 'differential_equations', prerequisites: ['integrals'] },
  { id: 'first_order', name: 'First-Order ODEs', category: 'differential_equations', prerequisites: ['ode_intro'] },
  { id: 'second_order', name: 'Second-Order ODEs', category: 'differential_equations', prerequisites: ['first_order'] },
  { id: 'laplace', name: 'Laplace Transforms', category: 'differential_equations', prerequisites: ['second_order', 'integrals'] },
];

export function createDefaultTopics(): Record<string, TopicNode> {
  const topics: Record<string, TopicNode> = {};
  for (const def of TOPIC_DEFINITIONS) {
    topics[def.id] = {
      id: def.id,
      name: def.name,
      category: def.category,
      prerequisites: def.prerequisites,
      mastery: 0,
      attempts: 0,
      errorHistory: [],
    };
  }
  return topics;
}

export function getTopicsByCategory(topics: Record<string, TopicNode>): Record<TopicCategory, TopicNode[]> {
  const result: Record<TopicCategory, TopicNode[]> = {
    pre_algebra: [],
    algebra: [],
    precalculus: [],
    calculus: [],
    linear_algebra: [],
    differential_equations: [],
  };
  for (const topic of Object.values(topics)) {
    result[topic.category].push(topic);
  }
  return result;
}

export function getReadyTopics(topics: Record<string, TopicNode>): TopicNode[] {
  return Object.values(topics).filter((topic) => {
    if (topic.mastery >= MASTERY_THRESHOLD_READY) return false;
    return topic.prerequisites.every(
      (prereqId) => (topics[prereqId]?.mastery ?? 0) >= MASTERY_THRESHOLD_READY
    );
  });
}

export function getTopicName(topics: Record<string, TopicNode>, topicId: string): string {
  return topics[topicId]?.name ?? topicId;
}

export const ALL_TOPIC_DEFINITIONS = TOPIC_DEFINITIONS;
