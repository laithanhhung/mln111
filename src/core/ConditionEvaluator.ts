import type { Condition, GameVariables, GameFlags } from '../types/game';

export class ConditionEvaluator {
  static evaluate(
    condition: Condition | undefined,
    variables: GameVariables,
    flags: GameFlags
  ): boolean {
    if (!condition) return true;

    if (condition.var !== undefined) {
      const value = variables[condition.var];
      if (condition.eq !== undefined) return value === condition.eq;
      if (condition.lt !== undefined) return value < condition.lt;
      if (condition.gt !== undefined) return value > condition.gt;
      if (condition.lte !== undefined) return value <= condition.lte;
      if (condition.gte !== undefined) return value >= condition.gte;
    }

    if (condition.flag !== undefined) {
      const flagValue = flags[condition.flag];
      if (condition.eq !== undefined) {
        return flagValue === condition.eq;
      }
      return Boolean(flagValue);
    }

    return true;
  }
}
