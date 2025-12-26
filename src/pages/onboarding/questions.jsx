import React, { useEffect, useState } from 'react'
import Card from '@/components/atoms/cards'
import Head from '@/components/molecules/head/head'
import Container from '@/components/templates/container'
import PageHead from '@/components/templates/pageHead'
import { FaEdit, FaTrash, FaArrowUp, FaArrowDown } from 'react-icons/fa'
import Button from '@/components/atoms/buttons/button'
import Loading from '@/components/atoms/loading'
import { notify } from '@/config/error'
import onboardingController from '@/controllers/onboarding'
import InputBox from '@/components/molecules/inputBox/inputBox'
import grid from '@/components/forms/forms.module.scss'
import DeleteConfirmModal from '@/components/shared/DeleteConfirmModal'

const QuestionsPage = () => {
    const [pageLoading, setPageLoading] = useState(true)
    const [questions, setQuestions] = useState([])
    const [editorOpen, setEditorOpen] = useState(false)
    const [selectedQuestion, setSelectedQuestion] = useState(null)
    const [saving, setSaving] = useState(false)
    const [deleteModal, setDeleteModal] = useState(null)
    const [deleting, setDeleting] = useState(false)

    // Form state
    const [question, setQuestion] = useState('')
    const [fieldType, setFieldType] = useState('TEXT')
    const [placeholder, setPlaceholder] = useState('')
    const [required, setRequired] = useState(true)
    const [minLength, setMinLength] = useState('')
    const [maxLength, setMaxLength] = useState('')
    const [isActive, setIsActive] = useState(true)

    useEffect(() => {
        fetchQuestions()
    }, [])

    const fetchQuestions = async () => {
        try {
            setPageLoading(true)
            const res = await onboardingController.getAllQuestions()
            if (res.success) {
                setQuestions(res.data || [])
            }
        } catch (error) {
            notify(error)
        } finally {
            setPageLoading(false)
        }
    }

    const openEditor = (q = null) => {
        if (q) {
            setSelectedQuestion(q)
            setQuestion(q.question)
            setFieldType(q.fieldType)
            setPlaceholder(q.placeholder || '')
            setRequired(q.required)
            setMinLength(q.minLength || '')
            setMaxLength(q.maxLength || '')
            setIsActive(q.isActive)
        } else {
            setSelectedQuestion(null)
            setQuestion('')
            setFieldType('TEXT')
            setPlaceholder('')
            setRequired(true)
            setMinLength('')
            setMaxLength('')
            setIsActive(true)
        }
        setEditorOpen(true)
    }

    const closeEditor = () => {
        setEditorOpen(false)
        setSelectedQuestion(null)
    }

    const handleSave = async () => {
        try {
            setSaving(true)

            const data = {
                question,
                fieldType,
                placeholder: placeholder || undefined,
                required,
                minLength: minLength ? parseInt(minLength) : undefined,
                maxLength: maxLength ? parseInt(maxLength) : undefined,
                displayOrder: selectedQuestion ? selectedQuestion.displayOrder : questions.length,
                isActive
            }

            let result
            if (selectedQuestion) {
                result = await onboardingController.updateQuestion(selectedQuestion.id, data)
                if (result.success) {
                    notify({ message: 'Question updated successfully!', type: 'success' })
                }
            } else {
                result = await onboardingController.createQuestion(data)
                if (result.success) {
                    notify({ message: 'Question created successfully!', type: 'success' })
                }
            }

            if (result.success) {
                closeEditor()
                fetchQuestions()
            } else {
                notify(result.error)
            }
        } catch (error) {
            notify(error)
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async () => {
        try {
            setDeleting(true)
            const result = await onboardingController.deleteQuestion(deleteModal.id)
            if (result.success) {
                notify({ message: 'Question deleted successfully!', type: 'success' })
                setDeleteModal(null)
                fetchQuestions()
            } else {
                notify(result.error)
            }
        } catch (error) {
            notify(error)
        } finally {
            setDeleting(false)
        }
    }

    const moveQuestion = async (index, direction) => {
        if (
            (direction === 'up' && index === 0) ||
            (direction === 'down' && index === questions.length - 1)
        ) {
            return
        }

        const items = Array.from(questions)
        const newIndex = direction === 'up' ? index - 1 : index + 1
        const [removed] = items.splice(index, 1)
        items.splice(newIndex, 0, removed)

        setQuestions(items)

        try {
            const questionIds = items.map(q => q.id)
            const res = await onboardingController.reorderQuestions(questionIds)
            if (res.success) {
                notify({ message: 'Questions reordered successfully!', type: 'success' })
            } else {
                notify(res.error)
                fetchQuestions()
            }
        } catch (error) {
            notify(error)
            fetchQuestions()
        }
    }

    if (pageLoading) {
        return (
            <div style={{ width: '100%' }}>
                <PageHead current="Questions">
                    <Head title="Onboarding Questions" back="/" />
                </PageHead>
                <Container>
                    <Loading />
                </Container>
            </div>
        )
    }

    return (
        <div style={{ width: '100%' }}>
            <PageHead current="Questions">
                <Head title="Onboarding Questions Management" back="/" />
            </PageHead>

            <Container>
                <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button onClick={() => openEditor()} primary>
                        Add Question
                    </Button>
                </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
                {/* Questions List */}
                <Card title="Questions (Use arrows to reorder)">
                    <div>
                        {questions.map((q, index) => (
                            <div
                                key={q.id}
                                style={{
                                    marginBottom: 12,
                                    padding: 16,
                                    background: '#fff',
                                    border: '1px solid #e0e0e0',
                                    borderRadius: 8,
                                    display: 'flex',
                                    gap: 12,
                                    alignItems: 'center'
                                }}
                            >
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                    <button
                                        onClick={() => moveQuestion(index, 'up')}
                                        disabled={index === 0}
                                        style={{
                                            padding: '4px 8px',
                                            background: index === 0 ? '#f5f5f5' : '#e0e0e0',
                                            border: 'none',
                                            borderRadius: 4,
                                            cursor: index === 0 ? 'not-allowed' : 'pointer',
                                            color: index === 0 ? '#ccc' : '#666'
                                        }}
                                    >
                                        <FaArrowUp />
                                    </button>
                                    <button
                                        onClick={() => moveQuestion(index, 'down')}
                                        disabled={index === questions.length - 1}
                                        style={{
                                            padding: '4px 8px',
                                            background: index === questions.length - 1 ? '#f5f5f5' : '#e0e0e0',
                                            border: 'none',
                                            borderRadius: 4,
                                            cursor: index === questions.length - 1 ? 'not-allowed' : 'pointer',
                                            color: index === questions.length - 1 ? '#ccc' : '#666'
                                        }}
                                    >
                                        <FaArrowDown />
                                    </button>
                                </div>

                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 600, marginBottom: 4 }}>{q.question}</div>
                                    <div style={{ fontSize: 13, color: '#666' }}>
                                        <span style={{ marginRight: 12 }}>Type: {q.fieldType}</span>
                                        <span style={{ marginRight: 12 }}>Required: {q.required ? 'Yes' : 'No'}</span>
                                        <span>Status: {q.isActive ? '✅ Active' : '❌ Inactive'}</span>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: 8 }}>
                                    <button
                                        onClick={() => openEditor(q)}
                                        style={{
                                            padding: '6px 12px',
                                            background: '#f0f0f0',
                                            border: 'none',
                                            borderRadius: 4,
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <FaEdit />
                                    </button>
                                    <button
                                        onClick={() => setDeleteModal(q)}
                                        style={{
                                            padding: '6px 12px',
                                            background: '#ffe0e0',
                                            border: 'none',
                                            borderRadius: 4,
                                            cursor: 'pointer',
                                            color: '#d32f2f'
                                        }}
                                    >
                                        <FaTrash />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {questions.length === 0 && (
                        <div style={{ padding: 32, textAlign: 'center', color: '#999' }}>
                            No questions yet. Click "Add Question" to create one.
                        </div>
                    )}
                </Card>

                {/* Discord Preview */}
                <Card title="Discord Modal Preview">
                    <div style={{ padding: 16, backgroundColor: '#36393f', color: 'white', borderRadius: 8 }}>
                        <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>
                            Customer Registration
                        </div>

                        {questions.filter(q => q.isActive).slice(0, 5).map(q => (
                            <div key={q.id} style={{ marginBottom: 12 }}>
                                <div style={{ fontSize: 12, color: '#b9bbbe', marginBottom: 4 }}>
                                    {q.question} {q.required && '*'}
                                </div>
                                {q.fieldType === 'TEXTAREA' ? (
                                    <textarea
                                        placeholder={q.placeholder}
                                        rows={3}
                                        style={{
                                            width: '100%',
                                            padding: 8,
                                            backgroundColor: '#202225',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: 4,
                                            fontSize: 14
                                        }}
                                        disabled
                                    />
                                ) : (
                                    <input
                                        placeholder={q.placeholder}
                                        style={{
                                            width: '100%',
                                            padding: 8,
                                            backgroundColor: '#202225',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: 4,
                                            fontSize: 14
                                        }}
                                        disabled
                                    />
                                )}
                            </div>
                        ))}

                        {questions.filter(q => q.isActive).length > 5 && (
                            <div style={{ fontSize: 12, color: '#faa61a', marginTop: 12 }}>
                                ⚠️ More than 5 questions - will show in multiple steps
                            </div>
                        )}
                    </div>
                </Card>
            </div>

            {/* Question Editor Modal */}
            {editorOpen && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        background: 'white',
                        borderRadius: 8,
                        width: '100%',
                        maxWidth: 600,
                        maxHeight: '90vh',
                        overflow: 'auto',
                        padding: 24
                    }}>
                        <h3 style={{ marginBottom: 24 }}>
                            {selectedQuestion ? 'Edit Question' : 'Add Question'}
                        </h3>

                        <div className={grid.wrap}>
                            <div className={grid.grid}>
                                <div className={grid.span2}>
                                    <InputBox
                                        label="Question Text"
                                        placeholder="Enter your question"
                                        value={question}
                                        valueChange={setQuestion}
                                    />
                                </div>

                                <div className={grid.span2}>
                                    <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Field Type</label>
                                    <select
                                        value={fieldType}
                                        onChange={(e) => setFieldType(e.target.value)}
                                        style={{
                                            width: '100%',
                                            padding: 12,
                                            border: '1px solid #ddd',
                                            borderRadius: 8,
                                            fontSize: 14
                                        }}
                                    >
                                        <option value="TEXT">Short Text</option>
                                        <option value="TEXTAREA">Long Text (Paragraph)</option>
                                    </select>
                                </div>

                                <div className={grid.span2}>
                                    <InputBox
                                        label="Placeholder"
                                        placeholder="Placeholder text..."
                                        value={placeholder}
                                        valueChange={setPlaceholder}
                                    />
                                </div>

                                <InputBox
                                    label="Min Length"
                                    type="number"
                                    placeholder="0"
                                    value={minLength}
                                    valueChange={setMinLength}
                                />
                                <InputBox
                                    label="Max Length"
                                    type="number"
                                    placeholder="0"
                                    value={maxLength}
                                    valueChange={setMaxLength}
                                />

                                <div className={grid.span2} style={{ marginTop: 16 }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                                        <input type="checkbox" checked={required} onChange={() => setRequired(!required)} />
                                        <span>Required</span>
                                    </label>
                                </div>

                                <div className={grid.span2}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                                        <input type="checkbox" checked={isActive} onChange={() => setIsActive(!isActive)} />
                                        <span>Active</span>
                                    </label>
                                </div>

                                <div className={grid.span2} style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                                    <Button onClick={closeEditor} secondary>Cancel</Button>
                                    <Button onClick={handleSave} primary disabled={saving}>
                                        {saving ? 'Saving...' : 'Save'}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation */}
            {deleteModal && (
                <DeleteConfirmModal
                    open={!!deleteModal}
                    onClose={() => setDeleteModal(null)}
                    onConfirm={handleDelete}
                    loading={deleting}
                    itemName={deleteModal.question}
                />
            )}
            </Container>
        </div>
    )
}

export default QuestionsPage
