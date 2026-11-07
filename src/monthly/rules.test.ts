import {describe,it,expect} from 'vitest';
import {inReportingPeriod,PERIOD_START,PERIOD_EXCLUSIVE_END} from './client';
describe('Inclusive America/Chicago reporting cutoff',()=>{
 it('includes Oct 5 local midnight',()=>expect(inReportingPeriod(PERIOD_START)).toBe(true));
 it('includes Nov 5 local last millisecond',()=>expect(inReportingPeriod('2026-11-05T23:59:59.999-06:00')).toBe(true));
 it('excludes November 6 and later',()=>expect(inReportingPeriod(PERIOD_EXCLUSIVE_END)).toBe(false));
 it('excludes before October 5',()=>expect(inReportingPeriod('2026-10-04T23:59:59.999-05:00')).toBe(false));
});
