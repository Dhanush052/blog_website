import { format } from "date-fns";

export default function Post({_id,title, summary, content, imgSrc, time,author }) {

    // Ensure time is a valid Date object or string
    const validTime = time ? new Date(time) : new Date();

    const formattedTime = isNaN(validTime.getTime()) ? 'Invalid Date' : format(validTime,'MMM d, yyyy HH:mm');

    return (
        <div className="post">
            <div className="img">
                <a href={`post/${_id}`}><img className="newxxx" src={"http://localhost:4000/"+imgSrc} alt=""/></a>
            </div>
            <div className="text">
                <a href={`post/${_id}`}><h2>{title}</h2></a>
                <p className="info">
                    <span className="author">{author}</span>
                    <time>{formattedTime}</time>
                </p>
                <p className="summary">{summary}</p>
            </div>
        </div>
    );
}
