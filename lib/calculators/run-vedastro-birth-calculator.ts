import type { CalculatorFormValues } from './calculator-form-types';
import {
  birthQueryToSearchParams,
  buildBirthVedastroQuery,
} from './birth-query';
import { fetchVedastroCalculator } from '@/lib/vedastro/fetch-calculator';
import type { VedastroCalculatorEndpoint } from '@/lib/utils/url';

export async function runVedastroBirthCalculator<T>(
  endpoint: VedastroCalculatorEndpoint,
  form: CalculatorFormValues,
): Promise<T> {
  const query = birthQueryToSearchParams(await buildBirthVedastroQuery(form));
  return fetchVedastroCalculator<T>(endpoint, query);
}
