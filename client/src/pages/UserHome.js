import { React, useEffect, useState } from 'react'
import { Link } from 'react-router-dom';
import API from "../utils/API";

export default function UserHome(props) {

    const [tags, setTags] = useState([]);

    const [popularTags, setPopularTags] = useState([]);

    const [filter, setFilter] = useState(false);

    const [services, setServices] = useState([]);

    const [questions, setQuestions] = useState([]);

    const [showAllMyTags, setShowAllMyTags] = useState(true);

    const [showAllPopularTags, setShowAllPopularTags] = useState(false);

    const fillFeeds = async tagsToFeed => {
        const questionsToFeed = await API.getTagQuestionFeed({ tags: tagsToFeed }, props.userState.token).catch(err => console.log(err));
        
        setQuestions(questionsToFeed.data);

        const servicesToFeed = await API.getTagServiceFeed({ tags: tagsToFeed }, props.userState.token).catch(err => console.log(err));
        setServices(servicesToFeed.data);
    }

    useEffect(async () => {
        let tagsToFeed = await API.getTagsByUser(props.userState.id);   
        tagsToFeed = tagsToFeed.data.map(tag => {
            tag.show = true;
            return tag;
        })   
        setTags(tagsToFeed);

        let popularTagFeed = await API.getPopularTags();
        popularTagFeed = popularTagFeed.data;        

        popularTagFeed.map(popularTag => {
            popularTag.show = tagsToFeed.find(tag => tag.name === popularTag.name);
        });

        setPopularTags(popularTagFeed);

        fillFeeds(tagsToFeed.concat(popularTagFeed));

    }, [filter]);

    const handleHideTag = tagToHide => {

        const temp = tags.map(tag => {
            if (tag.name === tagToHide) {
                tag.show = !tag.show;
            }
            return tag;
        })

        setTags(temp);

        const tempPopular = popularTags.map(tag => {
            if (tag.name === tagToHide) {
                tag.show = !tag.show;
            }
            return tag;
        })

        setPopularTags(tempPopular)

        fillFeeds(tags.concat(tempPopular));
    }

    const handleShowMyTags = () => {        
        setTags(tags.map(tag => {
            tag.show = !showAllMyTags;
            return tag;
        }));

        const tempPopular = popularTags.map(popularTag => {
            const foundTag = tags.find(tag => tag.name === popularTag.name)
            if(foundTag){
                popularTag.show = foundTag.show
            }
            return popularTag;          
        });

        setPopularTags(tempPopular);
        setShowAllMyTags(!showAllMyTags);
        fillFeeds(tags.concat(popularTags));
    }

    const handleShowPopularTags = () => {
        setPopularTags(popularTags.map(tag => {
            tag.show = !showAllPopularTags;
            return tag;
        }));

        const tempMy = tags.map(myTag => {
            const foundTag = popularTags.find(tag => tag.name === myTag.name)
            if(foundTag){
                myTag.show = foundTag.show
            }
            return myTag;          
        });

        setTags(tempMy);
        setShowAllPopularTags(!showAllMyTags);
        fillFeeds(tags.concat(popularTags));
    }

    return (
        <div>
            <h1>User Home</h1>
            <h2>My feed</h2>
            <h3>My Tags</h3>
            <span onClick={handleShowMyTags}>{showAllMyTags ? "hide" : "show"} all</span>
            <ul>
                {tags.map(tag => <li key={tag.id}><Link to={`/tag/${tag.id}`}>{tag.name}</Link><img src={tag.show ? `./assets/images/show.png` : `./assets/images/hide.png`} onClick={() => handleHideTag(tag.name)}/></li>)}
            </ul>
            <h3>Popular Tags</h3>
            <span onClick={handleShowPopularTags}>{showAllPopularTags ? "hide" : "show"} all</span>
            <ul>
                {popularTags.map(tag => <li key={tag.id}><Link to={`/tag/${tag.id}`}>{tag.name}</Link><img src={tag.show ? `./assets/images/show.png` : `./assets/images/hide.png`} onClick={() => handleHideTag(tag.name)}/></li>)}
            </ul>
            <h3>Questions</h3>
            <ul>
                {questions.map(question => {
                    return <li key={question.id}>
                        <Link to={`/question/${question.id}`}>{question.title}</Link> - 
                        up: {question.Ratings.filter(rating => rating.isPositive).length} - 
                        down: {question.Ratings.filter(rating => !rating.isPositive).length}
                        <br />
                        {question.Tags.map(tag => <span key={tag.id}><Link to={`/tag/${tag.id}`}>{tag.name}</Link> </span>)}
                    </li>
                })}
            </ul>
            <h3>Services</h3>
            <ul>
                {services.map(service => {
                    return <li key={service.id}>
                        <Link to={`/service/${service.id}`}>{service.name}</Link> -  
                        up: {service.Ratings.filter(service => service.isPositive).length} - 
                        down: {service.Ratings.filter(service => service.isPositive).length}
                        <br/>
                         - <Link to={`/users/${service.UserId}`}>{service.User.userName}</Link><br />
                        {service.Tags.map(tag => <span id={tag.id}><Link to={`/tag/${tag.id}`}>{tag.name}</Link> </span>)}
                    </li>
                }
                )}
            </ul>
        </div>
    )
}
