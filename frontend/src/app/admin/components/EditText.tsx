import dynamic from 'next/dynamic';
import { memo } from 'react';

const JoditEditor = dynamic(() => import('jodit-react'), {
    ssr: false,
});

interface EditTextProps {
    value: string;
    onChange: (value: string) => void;
}
const EditText = memo(({ value, onChange }: EditTextProps) => {
    return (
        <JoditEditor
            value={value}
            onChange={onChange}
            config={{ height: 500 }}
        />
    );
})

EditText.displayName='EdiText';
export default EditText;