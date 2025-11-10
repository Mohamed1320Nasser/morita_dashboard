import DataInput from "@/components/atoms/inputs/dataInput";
import InputLabel from "@/components/atoms/labels/inputLabel";
import React from "react";
import styles from "./inputBox.module.scss";

const InputBox = ({ ar, textarea, p0, label, className, type, value, valueChange, placeholder, button, dataInput, onKeyPress, row, zero }) => {
  return (
    <>
      {row ? (
        <div
          className={`${styles.inputBox} ${zero && "jalkjslf"}  ${ar && styles.ar} ${className}`}
        >
          <div className="row align-items-center">
            <div className={`col-md-5 ${p0 && "pl-0"}`}>
              <InputLabel ar={ar}>{label}</InputLabel>
            </div>
            <div className="col-md-5">
              <DataInput
                onKeyPress={onKeyPress}
                ar={ar}
                textarea={textarea}
                dataInput={dataInput}
                placeholder={placeholder}
                value={value}
                valueChange={valueChange}
                type={type}
              ></DataInput>
            </div>
          </div>
        </div>
      ) : (
        <div className={`${styles.inputBox} ${ar && styles.ar} ${className}`}>
          <InputLabel ar={ar}>{label}</InputLabel>
          <DataInput onKeyPress={onKeyPress} button={button} ar={ar} textarea={textarea} dataInput={dataInput} placeholder={placeholder} value={value} valueChange={valueChange} type={type}></DataInput>
        </div>
      )}
    </>
  );
};

export default InputBox;
