<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Solicitações de Férias</title>
<style>body{font-family:sans-serif;font-size:12px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #ddd;padding:6px 8px;text-align:left}th{background:#f5f5f5;font-weight:600}h1{font-size:18px;margin-bottom:16px}</style>
</head>
<body>
<h1>Relatório de Solicitações de Férias</h1>
<table>
<thead><tr>@foreach(($headers ?? ['Colaborador','Início','Fim','Dias','Status','Justificativa']) as $h)<th>{{$h}}</th>@endforeach</tr></thead>
<tbody>
@foreach($rows as $r)
<tr>
@foreach(($headers ?? ['Colaborador','Início','Fim','Dias','Status','Justificativa']) as $h)
@if($h === 'Colaborador')<td>{{$r->user->name}}</td>
@elseif($h === 'Início')<td>{{$r->start_date->format('d/m/Y')}}</td>
@elseif($h === 'Fim')<td>{{$r->end_date->format('d/m/Y')}}</td>
@elseif($h === 'Dias')<td>{{$r->requested_days}}</td>
@elseif($h === 'Status')<td>{{$r->status}}</td>
@elseif($h === 'Justificativa')<td>{{$r->justification ?? '—'}}</td>
@endif
@endforeach
</tr>
@endforeach
</tbody>
</table>
<p style="margin-top:20px;color:#999">Gerado em {{now()->format('d/m/Y H:i')}}</p>
</body>
</html>
