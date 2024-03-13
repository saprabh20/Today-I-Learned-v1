import { useEffect, useState } from "react";
import supabase from "./supabase"

import "./styles.css";

function App() {
    //1. define state variable
    const [showForm, setShowForm] = useState(false);
    const [facts, setFacts] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [currCategory, setCurrCategory] = useState("all");

    useEffect(function () {
        async function getFacts() {
            setIsLoading(true);

            let query = supabase.from('facts').select('*');

            if (currCategory !== "all") {
                query = query.eq("category", currCategory);
            }

            let { data: facts, error } = await query.order("votesInteresting", { ascending: false }).limit(1000);

            if (!error) {
                setFacts(facts);
            } else {
                alert("There was a problem in getting the data. Check console logs for more detail.");
                console.error(error);
            }
            setIsLoading(false);
        }
        getFacts();
    }, [currCategory])


    return (<>
        {/* HEADER */}
        <Header showForm={showForm} setShowForm={setShowForm} />
        {/* 2. Use state variable */}
        {showForm ? <NewFactForm setFacts={setFacts} setShowForm={setShowForm} /> : null}

        <main className="main">
            <CategoryFilters setCurrCategory={setCurrCategory} />
            {isLoading ? <Loader /> : <FactList facts={facts} setFacts={setFacts} />}
        </main>
    </>
    );
}

function Loader() {
    return (
        <div className="spinner-container">
          <div className="loading-spinner"></div>
        </div>
      );
}

function Header({ showForm, setShowForm }) {
    const appTitle = "Today I Learned";

    return <header className="header">
        <div className="logo">
            <img src="logo.png" height="68" width="68" alt="Today I Learned Logo" />
            <h1>{appTitle}</h1>
        </div>
        <button
            className="btn btn-large btn-open"
            // 3. Update state variable
            onClick={() => setShowForm((show) => !show)}
        >{showForm ? "Close" : "Share a fact"}</button>
    </header>
}

const CATEGORIES = [
    { name: "technology", color: "#3b82f6" },
    { name: "science", color: "#16a34a" },
    { name: "finance", color: "#ef4444" },
    { name: "society", color: "#eab308" },
    { name: "entertainment", color: "#db2777" },
    { name: "health", color: "#14b8a6" },
    { name: "history", color: "#f97316" },
    { name: "news", color: "#8b5cf6" },
]

function isValidHttpUrl(string) {
    let url;
    try {
        url = new URL(string);
    } catch (_) {
        return false;
    }
    return url.protocol === "http:" || url.protocol === "https:";
}

function NewFactForm({ setFacts, setShowForm }) {
    const [text, setText] = useState("");
    const [source, setSource] = useState("");
    const [category, setCategory] = useState("");
    const [isUploading, setIsUploading] = useState(false)
    const textLength = text.length;

    async function handleSubmit(e) {
        // 1. Prevent browser reload
        e.preventDefault();
        console.log(text, source, category);

        // 2. Check if data is valid. If so, create a new fact.
        if (text && isValidHttpUrl(source) && category && textLength <= 200) {
            // 3. Create a new fact object
            // const newFact = {
            //     id: Math.round(Math.random() * 1000000),
            //     text,
            //     source,
            //     votesInteresting: 0,
            //     votedMindBlowing: 0,
            //     votesFalse: 0,
            //     category,
            // }

            // 3. Upload fact to Supabase and receive the new fact object
            setIsUploading(true);
            const { data: newFact, error } = await supabase.from("facts").insert([{ text, source, category }]).select();
            setIsUploading(false);

            // 4. Add the new fact to the UI: add the fact to the state
            if (!error) {
                setFacts((facts) => [newFact[0], ...facts])
            } else {
                alert("Error occured. Check console logs for more detail.");
                console.error(error);
            }

            // 5. Reset input fields
            setText("");
            setSource("");
            setCategory("");

            // 6. Close the form
            setShowForm(false);
        }

    }

    return (
        <form className="fact-form" onSubmit={handleSubmit}>
            <input
                type="text"
                placeholder="Share a fact with the world..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                disabled={isUploading}
                maxLength={200}
            />
            <span>{200 - textLength}</span>
            <input
                type="text"
                placeholder="Trustworthy source..."
                value={source}
                onChange={(e) => setSource(e.target.value)}
                disabled={isUploading}
            />
            <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                disabled={isUploading}
            >
                <option value="">Choose category:</option>
                {CATEGORIES.map((cat) => <option key={cat.name} value={cat.name}>
                    {cat.name.toUpperCase()}
                </option>)}
            </select>
            <button className="btn btn-large" disabled={isUploading}>Post</button>
        </form>
    );
}

function CategoryFilters({ setCurrCategory }) {
    return <aside>
        <ul>
            <li className="category">
                <button
                    className="btn btn-all-categories"
                    onClick={() => setCurrCategory("all")}
                >All</button>
            </li>

            {CATEGORIES.map((cat) => (
                <li key={cat.name} className="category">
                    <button
                        className="btn btn-category"
                        style={{ backgroundColor: cat.color }}
                        onClick={() => setCurrCategory(cat.name)}
                    >{cat.name}</button>
                </li>
            ))}
        </ul>
    </aside>
}

function FactList({ facts, setFacts }) {
    if (facts.length === 0) {
        return <p className="message">No facts for this category yet! Create the first one.</p>
    }
    return (
        <section>
            <ul className="facts-list">
                {facts.map((fact) => (
                    <Fact key={fact.id} fact={fact} setFacts={setFacts} />
                ))}
            </ul>
            <p>There are {facts.length} facts in the DataBase. Add your own!</p>
        </section>
    );
}

function Fact({ fact, setFacts }) {
    const [isUpdating, setIsUploading] = useState(false);
    const isDisputed = fact.votesInteresting + fact.votesMindBlowing < fact.votesFalse;
    async function handleVote(columnName) {
        setIsUploading(true);
        const { data: updatedFact, error } = await supabase.from("facts").update({ [columnName]: fact[columnName] + 1 }).eq("id", fact.id).select();
        setIsUploading(false);
        if (!error) {
            setFacts((facts) => facts.map((f) => f.id === fact.id ? updatedFact[0] : f));
        }
    }
    return (
        <li className="fact">
            <p>
                {isDisputed ? <span className="disputed">[⛔DISPUTED]</span> : null}
                {fact.text}
                <a
                    className="source"
                    href="{fact.source}"
                    target="_blank"
                >(Source)</a>
            </p>
            <span
                className="tag"
                style={{
                    backgroundColor: CATEGORIES.find(
                        (cat) => cat.name === fact.category
                    ).color,
                }}>{fact.category}</span>
            <div className="vote-buttons">
                <button onClick={() => handleVote("votesInteresting")} disabled={isUpdating}>👍 {fact.votesInteresting}</button>
                <button onClick={() => handleVote("votesMindBlowing")} disabled={isUpdating}>🤯 {fact.votesMindBlowing}</button>
                <button onClick={() => handleVote("votesFalse")} disabled={isUpdating}>⛔ {fact.votesFalse}</button>
            </div>
        </li>
    );
}

export default App;
