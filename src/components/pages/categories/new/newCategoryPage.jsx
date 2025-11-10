import React, { useEffect, useState } from "react";
import Button from "@/components/atoms/buttons/button";
import Card from "@/components/atoms/cards";
import Head from "@/components/molecules/head/head";
import InputBox from "@/components/molecules/inputBox/inputBox";
import LangMenu from "@/components/molecules/langMenu";
import Container from "@/components/templates/container";
import PageHead from "@/components/templates/pageHead";
import { useRouter } from "next/router";
import { notify } from "@/config/error";
import { Toaster } from "react-hot-toast";
import { ToastContainer, toast } from "react-toastify";
import { Slide } from "react-toastify";
import categoryController from "@/controllers/category";
import Uploading from "@/components/atoms/loaders/uploading";

const NewCategoryPage = ({ id }) => {
  const router = useRouter();
  const [lang, setLang] = useState(1);

  const [originalTitle, setOriginalTitle] = useState("");
  const [titleLanguage, setTitleLanguage] = useState([]);
  const [articleTitle, setArticleTitle] = useState("");

  const [originalDescription, setOriginalDescription] = useState("");
  const [descriptionLanguage, setDescriptionLanguage] = useState([]);
  const [articleDescription, setArticleDescription] = useState("");

  const [contentLanguage, setContentLanguage] = useState([]);
  const [articleContent, setArticleContent] = useState("");

  useEffect(() => {
    if (articleTitle) {
      const existingIndex = titleLanguage.findIndex(
        (title) => title.langCode === lang
      );

      if (existingIndex !== -1) {
        const updatedTitles = [...titleLanguage];
        updatedTitles[existingIndex] = { text: articleTitle, langCode: lang };
        setTitleLanguage(updatedTitles);
      } else {
        setTitleLanguage((prevTitles) => [
          ...prevTitles,
          { text: articleTitle, langCode: lang },
        ]);
      }
    } else {
      const updatedTitles = titleLanguage.filter(
        (title) => title.langCode !== lang
      );
      setTitleLanguage(updatedTitles);
    }
  }, [articleTitle, lang]);

  useEffect(() => {
    if (articleDescription) {
      const existingIndex = descriptionLanguage.findIndex(
        (description) => description.langCode === lang
      );

      if (existingIndex !== -1) {
        const updatedDescriptions = [...descriptionLanguage];
        updatedDescriptions[existingIndex] = {
          text: articleDescription,
          langCode: lang,
        };
        setDescriptionLanguage(updatedDescriptions);
      } else {
        setDescriptionLanguage((prevDescriptions) => [
          ...prevDescriptions,
          { text: articleDescription, langCode: lang },
        ]);
      }
    } else {
      const updatedDescriptions = descriptionLanguage.filter(
        (description) => description.langCode !== lang
      );
      setDescriptionLanguage(updatedDescriptions);
    }
  }, [articleDescription, lang]);

  const langChange = (value) => {
    setLang(value);

    if (isLanguageInTitles(value)) {
      const titleWithLang = titleLanguage.find(
        (title) => title.langCode === value
      );
      setArticleTitle(titleWithLang.text);
    } else {
      setArticleTitle("");
    }

    if (isLanguageInDescriptions(value)) {
      const descriptionWithLang = descriptionLanguage.find(
        (description) => description.langCode === value
      );
      setArticleDescription(descriptionWithLang.text);
    } else {
      setArticleDescription("");
    }

    if (isLanguageInContents(value)) {
      const contentWithLang = contentLanguage.find(
        (content) => content.langCode === value
      );
      setArticleContent(contentWithLang.text);
    } else {
      setArticleContent("");
    }
  };

  const isLanguageInTitles = (langCode) => {
    return titleLanguage.some((title) => title.langCode === langCode);
  };

  const isLanguageInDescriptions = (langCode) => {
    return descriptionLanguage.some((desc) => desc.langCode === langCode);
  };

  const isLanguageInContents = (langCode) => {
    return contentLanguage.some((content) => content.langCode === langCode);
  };

  const isLangDone = (langCode) => {
    const isInTitles = titleLanguage.some(
      (title) => title.langCode === langCode
    );

    const isInDescriptions = descriptionLanguage.some(
      (desc) => desc.langCode === langCode
    );

    return isInTitles && isInDescriptions;
  };

  const isOrignialDone = () => {
    const isTitle = originalTitle.length > 0;
    const isDesc = originalDescription.length > 0;
    return isTitle && isDesc;
  };

  const Success = (message) => {
    toast.success(message, {
      position: "top-right",
      autoClose: 1000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "light",
    });
  };

  const [uploading, setUploading] = useState(false);

  const [articleData, setArticleData] = useState({});

  const getSingleArticle = async () => {
    try {
      const response = await categoryController.getSingleCategory(id);
      if (response && !response.error) {
        const data = response.data;
        setArticleData(data);

        const anyTitle = data.title.find((item) => item.languageCode === "any");

        setOriginalTitle(anyTitle.text);

        const newTitleLanguage = data.title
          .filter((item) => item.languageCode !== "any")
          .map(({ text, languageCode }) => ({ text, langCode: languageCode }));

        setTitleLanguage(newTitleLanguage);

        const anyDescription = data.description?.find(
          (item) => item.languageCode === "any"
        ) || '';

        setOriginalDescription(anyDescription ? anyDescription.text : "");

        const newDescriptionLanguage = data.description
          ?.filter((item) => item.languageCode !== "any")
          .map(({ text, languageCode }) => ({ text, langCode: languageCode })) || [];

        setDescriptionLanguage(newDescriptionLanguage);
      }
    } catch (error) {
      console.error("Error fetching Tag details:", error);
      notify("Error fetching Tag details");
    }
  };

  useEffect(() => {
    if (id) {
      getSingleArticle();
    }
  }, [id]);

  const handleSave = () => {
    let err = [];
    if (!originalTitle) {
      err.push("Please fill the original title");
    }
    // if (!originalDescription) {
    //   err.push("Please fill the original description");
    // }
    if (err.length > 0) {
      notify(err[0]);
    } else {
      setUploading(true);
      if (id) {
        handleUpdate();
      } else {
        handleSubmit();
      }
    }
  };

  const handleSubmit = async () => {
    const data = {
      originalTitle: originalTitle,
      titleLanguage: titleLanguage,
      originalDescription: originalDescription,
      descriptionLanguage: descriptionLanguage,
    };
    const response = await categoryController.createCategory(data);
    if (response && !response.error) {
      Success("Category has been added successfully");
      setTimeout(() => {
        router.push("/categories");
      }, 1000);
    } else {
      notify("Something went wrong");
      setUploading(false);
    }
  };

  const handleUpdate = async () => {
    const data = {
      originalTitle: originalTitle,
      titleLanguage: titleLanguage,
      originalDescription: originalDescription,
      descriptionLanguage: descriptionLanguage,
    };

    const response = await categoryController.updateCategory(id, data);

    if (response && !response.error) {
      Success("Category has been updated successfully");
      setTimeout(() => {
        router.push("/categories");
      }, 1000);
    } else {
      notify("Something went wrong");
      setUploading(false);
    }
  };

  return (
    <div>
      <PageHead current="Manage Category">
        <Head title={id ? "Edit Category" : "New Category"} />
      </PageHead>
      <Container>
        {uploading && <Uploading state={1} />}
        <section>
          <LangMenu
            lang={lang}
            originalTitle={originalTitle}
            originalDescription={originalDescription}
            isLangDone={isLangDone}
            langChange={langChange}
            isOrignialDone={isOrignialDone}
          />
          <Card className="mt-0">
            <div className="row  justify-content-between">
              <div className="col-md-4">
                {lang === 1 ? (
                  <InputBox
                    value={originalTitle}
                    valueChange={(event) => setOriginalTitle(event)}
                    dataInput
                    label="Title"
                    placeholder="Enter your Title"
                  />
                ) : (
                  <InputBox
                    value={articleTitle}
                    valueChange={(event) => setArticleTitle(event)}
                    dataInput
                    label={lang === "ar" ? "Title (ar)" : "Title (en)"}
                    placeholder="Enter your Title"
                  />
                )}
              </div>
              <div className="col-md-5">
                {lang === 1 ? (
                  <InputBox
                    textarea
                    value={originalDescription}
                    valueChange={(event) => setOriginalDescription(event)}
                    dataInput
                    label="Description"
                    placeholder="Enter your Description"
                  />
                ) : (
                  <InputBox
                    textarea
                    value={articleDescription}
                    valueChange={(event) => setArticleDescription(event)}
                    dataInput
                    label={
                      lang === "ar" ? "Description (ar)" : "Description (en)"
                    }
                    placeholder="Enter your Description"
                  />
                )}
              </div>
            </div>
          </Card>
        </section>

        <div className="buttons mb-3 mt-0">
          <Button onClick={handleSave} primary>
            {id ? "Update" : "Create"}
          </Button>
        </div>
      </Container>
      <Toaster position="bottom-left" reverseOrder={true} />
      <ToastContainer transition={Slide} />
    </div>
  );
};

export default NewCategoryPage;
