import { redirect } from 'next/navigation';
export default function Contact({ params }: { params: { locale: string } }) { redirect(`/${params.locale}/about/location`); }
