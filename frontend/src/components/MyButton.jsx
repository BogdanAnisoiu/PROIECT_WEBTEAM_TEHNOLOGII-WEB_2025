import './MyButton.css';

export default function MyButton({ text, onClick }) {
    return (
        <button className="my-button" onClick={onClick}>
            {text}
        </button>
    );
}
