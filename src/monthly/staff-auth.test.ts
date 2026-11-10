import { it,expect,vi,beforeEach } from 'vitest';
const mocks=vi.hoisted(()=>({signInWithPassword:vi.fn(),getUser:vi.fn(),signOut:vi.fn(),rpc:vi.fn()}));
vi.mock('./client',()=>({monthlyClient:{auth:mocks,rpc:mocks.rpc}}));
import {signInStaff} from './staff-auth';
beforeEach(()=>{vi.resetAllMocks();mocks.signInWithPassword.mockResolvedValue({error:null});mocks.getUser.mockResolvedValue({data:{user:{id:'synthetic-unit'}},error:null});mocks.signOut.mockResolvedValue({error:null});});
it('password auth requires live staff role before granting staff view',async()=>{
 mocks.rpc.mockResolvedValue({data:'admin',error:null});expect(await signInStaff('unit@example.invalid','UNIT-only')).toBe(true);
 expect(mocks.rpc).toHaveBeenCalledWith('monthly_staff_role');
});
it('membership-only user is signed out, never promoted by email',async()=>{
 mocks.rpc.mockResolvedValue({data:null,error:null});expect(await signInStaff('unit@example.invalid','UNIT-only')).toBe(false);expect(mocks.signOut).toHaveBeenCalledOnce();
});
it('failed auth or role read fails closed',async()=>{
 mocks.signInWithPassword.mockResolvedValue({error:{message:'denied'}});expect(await signInStaff('unit@example.invalid','UNIT-only')).toBe(false);expect(mocks.rpc).not.toHaveBeenCalled();
 mocks.signInWithPassword.mockResolvedValue({error:null});mocks.rpc.mockResolvedValue({data:'admin',error:{message:'unavailable'}});expect(await signInStaff('unit@example.invalid','UNIT-only')).toBe(false);
});
