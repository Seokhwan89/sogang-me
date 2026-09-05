'use client';
import { setReservation } from '@/app/admin/actions';

/** 관리자 예약 목록의 승인/거절/삭제 버튼. 삭제는 실수 방지를 위해 확인창을 띄운다. */
export function ReservationStatusButton({ id, status, label, back, className }: { id: number; status: 'approved' | 'rejected' | 'delete'; label: string; back: string; className?: string }) {
  return (
    <form action={setReservation} onSubmit={(e) => { if (status === 'delete' && !confirm('이 예약을 삭제할까요? 되돌릴 수 없습니다.')) e.preventDefault(); }}>
      <input type="hidden" name="id" value={id} /><input type="hidden" name="status" value={status} /><input type="hidden" name="back" value={back} />
      <button className={className}>{label}</button>
    </form>
  );
}
