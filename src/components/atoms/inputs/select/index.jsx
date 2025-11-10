import React from 'react'
import Select from 'react-select'

const SelectView = (props) => {
    return (
        <Select
            isClearable={true}
            value={props.value}
            onChange={props.onChange}
            onMenuScroll={props.onMenuScroll}
            isMulti={props.isMulti}
            options={props.options}
            placeholder={props.placeholder || "Select"}
            inputValue={props.inputValue}
            onInputChange={props.onInputChange}
            isLoading={props.isLoading}
            styles={{
                control: (baseStyles, state) => ({
                    ...baseStyles,
                    borderColor: "#f6f6f6",
                    transition: "all .3s",
                    borderWidth: state.isFocused ? 1 : 1,
                    borderColor: state.isFocused ? '#006666' : "#f6f6f6",
                    boxShadow: "unset",
                    fontWeight: 300,
                    fontSize: 14,
                    marginTop: 10,
                    paddingTop: 1,
                    paddingBottom: 1,
                }),
                option: (baseStyles, state) => ({
                    ...baseStyles,
                    fontWeight: 300,
                    fontSize: 14,
                }),
                menu: (baseStyles, state) => ({
                    ...baseStyles,
                    zIndex: 3,
                }),

            }}
            theme={(theme) => ({
                ...theme,
                borderRadius: 6,
                colors: {
                    ...theme.colors,
                    primary25: '#00336640',
                    primary: '#003366',
                },
            })}
        />
    )
}

export default SelectView