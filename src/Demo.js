import React, { useMemo, useState } from "react";
// Ant Design
import { Button, Table, Input, Form, Space, Tag, Card, Divider, Typography } from "antd";
import "antd/dist/reset.css"; // antd v5 CSS reset

// AG Grid
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";

const { Title, Text } = Typography;

/**
 * ===============================
 *  Signpl-like WRAPPER components
 *  (antd를 감싸 회사 규칙을 강제)
 * ===============================
 */

// 회사 디자인 규칙: 기본 primary, 굵은 폰트, 둥근 버튼, 클릭 로깅
const SpButton = ({ style, onClick, ...rest }) => {
  const handleClick = (e) => {
    // 공통 로깅/권한 체크/i18n 등도 가능
    console.log("[signpl] Button clicked");
    onClick?.(e);
  };
  return (
    <Button
      type="primary"
      size="middle"
      style={{ borderRadius: 10, fontWeight: 600, ...style }}
      onClick={handleClick}
      {...rest}
    />
  );
};

// 회사 디자인 규칙: 기본 prefix, 테두리, 크기 등 고정
const SpInput = ({ style, ...rest }) => {
  return (
    <Input
      allowClear
      style={{ borderRadius: 8, height: 38, ...style }}
      placeholder={rest.placeholder ?? "회사 규칙: 기본 플레이스홀더"}
      {...rest}
    />
  );
};

/** 샘플 데이터 */
const USERS = [
  { id: 1, name: "홍길동", age: 31, role: "admin", tags: ["core", "active"] },
  { id: 2, name: "김영희", age: 27, role: "editor", tags: ["active"] },
  { id: 3, name: "이철수", age: 41, role: "viewer", tags: ["new"] },
  { id: 4, name: "박민준", age: 35, role: "editor", tags: ["core"] },
  { id: 5, name: "최수빈", age: 29, role: "viewer", tags: [] },
];

export default function Demo() {
  const [keyword, setKeyword] = useState("");
  const [spKeyword, setSpKeyword] = useState("");

  // === antd Table 구성 ===
  const columns = [
    { title: "이름", dataIndex: "name", key: "name" },
    { title: "나이", dataIndex: "age", key: "age", sorter: (a, b) => a.age - b.age },
    { title: "권한", dataIndex: "role", key: "role", filters: [
        { text: "admin", value: "admin" },
        { text: "editor", value: "editor" },
        { text: "viewer", value: "viewer" },
      ],
      onFilter: (value, record) => record.role === value,
    },
    { title: "태그", key: "tags", render: (_, r) => (
        <Space wrap>
          {r.tags.length ? r.tags.map((t) => <Tag key={t}>{t}</Tag>) : <Text type="secondary">없음</Text>}
        </Space>
      )
    },
  ];

  const antdData = useMemo(() => {
    const k = keyword.trim();
    if (!k) return USERS.map((u) => ({ key: u.id, ...u }));
    return USERS.filter((u) => u.name.includes(k)).map((u) => ({ key: u.id, ...u }));
  }, [keyword]);

  // === AG Grid 구성 ===
  const agColDefs = useMemo(() => ([
    { headerName: "이름", field: "name", sortable: true, filter: true },
    { headerName: "나이", field: "age", sortable: true, filter: "agNumberColumnFilter" },
    { headerName: "권한", field: "role", sortable: true, filter: true },
  ]), []);

  const agRows = useMemo(() => USERS, []);

  return (
    <div style={{ padding: 24, background: "#0b1020", minHeight: "100vh" }}>
      <Title level={3} style={{ color: "#fff", marginBottom: 16 }}>
        antd 단독 vs signpl(antd 래핑) vs AG Grid — 한 화면 미니 비교
      </Title>

      <Text style={{ color: "#c7d2fe" }}>
        • 같은 데이터(USERS)를 세 방식으로 표시합니다. 각 카드의 설명을 읽고, 어떤 상황에서 어떤 방식을 쓰는지 감을 잡아보세요.
      </Text>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: 16,
          marginTop: 16,
        }}
      >
        {/* ============ (1) ANTD ONLY ============ */}
        <Card style={{ borderRadius: 16 }} title={<b>① antd 단독</b>}>
          <Text>
            - 범용 UI 라이브러리 그대로 사용<br/>
            - 빠르게 화면 구현, 세밀 제어는 props/컴포지션으로 해결<br/>
            - 테이블은 정렬/필터 등 적당한 기능 제공
          </Text>
          <Divider />
          <Space>
            <Input
              placeholder="이름 검색"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              style={{ width: 160 }}
            />
            <Button onClick={() => setKeyword("")}>초기화</Button>
          </Space>
          <div style={{ marginTop: 12 }}>
            <Table size="small" columns={columns} dataSource={antdData} pagination={{ pageSize: 4 }} />
          </div>
        </Card>

        {/* ============ (2) SIGNPL-LIKE WRAPPER ============ */}
        <Card style={{ borderRadius: 16 }} title={<b>② signpl (antd 래핑 예시)</b>}>
          <Text>
            - 원본 코드는 건드리지 않고, <b>감싸서</b> 회사 규칙을 강제<br/>
            - 공통 스타일/로그/권한체크/i18n 등을 <b>자동</b> 적용<br/>
            - 팀 일관성↑, 학습비용↓
          </Text>
          <Divider />
          <Space>
            <SpInput value={spKeyword} onChange={(e) => setSpKeyword(e.target.value)} placeholder="회사 규칙: 기본 플레이스홀더" />
            <SpButton onClick={() => setSpKeyword("")}>초기화</SpButton>
          </Space>
          <div style={{ marginTop: 12 }}>
            <Text type="secondary">(예시) 여기서는 그리드 대신, 래퍼가 강제한 스타일과 동작을 체험하세요.</Text>
          </div>
        </Card>

        {/* ============ (3) AG GRID ============ */}
        <Card style={{ borderRadius: 16 }} title={<b>③ AG Grid (대규모/고급 그리드)</b>}>
          <Text>
            - 대용량/고급 기능(그룹핑, 피벗, 엑셀 내보내기 등)에 강함<br/>
            - 정렬/필터/가상 스크롤/열 리사이즈 등 기본 내장<br/>
            - 엔터프라이즈 기능은 별도 라이선스 필요
          </Text>
          <Divider />
          <div className="ag-theme-alpine" style={{ height: 260, width: "100%" }}>
            <AgGridReact rowData={agRows} columnDefs={agColDefs} pagination={true} paginationPageSize={5} />
          </div>
        </Card>
      </div>

      <Divider />
      <Card style={{ borderRadius: 16 }}>
        <Title level={5}>언제 무엇을 쓸까?</Title>
        <ul>
          <li><b>antd 단독</b>: 일반 CRUD 화면, 복잡하지 않은 테이블/폼 빠르게 만들 때.</li>
          <li><b>signpl(래퍼)</b>: 브랜드 일관성·공통 규칙을 강제하고 싶을 때(색/타이포/버튼 크기/로그 등).</li>
          <li><b>AG Grid</b>: 행 수가 많거나(수천~수만), 엑셀급 기능(그룹/피벗/집계/내보내기)이 필요할 때.</li>
        </ul>
      </Card>
    </div>
  );
}
