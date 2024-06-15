import { useEffect, useState } from "react";
import Post from "../post";

export default function IndexPage(){
    const [posts,setPosts] = useState([]);
    useEffect(() => {
        fetch('http://localhost:4000/post')
            .then(response => {
                response.json().then(posts => {
                    setPosts(posts);
                });
            });
    }, []);
    
    return(
        <>
            {
                posts.length > 0 && (
                    posts.map((post,index)=>(
                        <div key={index}>
                            <Post title={post.title} summary={post.summary} content={post.content} time={post.createdAt} imgSrc={post.cover} author={post.author.username} _id={post._id}/>
                            
                        </div>
                    ))
                )
            }
        </>
    );
}